/* eslint-disable @typescript-eslint/no-require-imports */
import { ObserveResult } from "@browserbasehq/stagehand";
import { Assistant } from "ai/utils/assistants";
import { Tool, tool } from "ai/utils/tools";
import axios from "axios";
import fs from "fs";
import { ChatModel } from "original-openai/resources.mjs";
import path from "path";
import { sign } from "utils/encryption";
import lambdas from "utils/lambdas.json";
import { p } from "utils/types";
import { ImageMessage, run } from "./utils";

const DEFAULT_MODEL = "gpt-4.1-nano";
const DEFAULT_WEB_SEARCH_MODEL = "gpt-4o";
const DEFAULT_WEB_TASK_MODEL = "gpt-4o-mini";

class DoNothing {
  @(p`r:doNothing`) a: "doNothing";
}
const doNothingTool = tool(
  { lambda: "", description: "Do nothing" },
  DoNothing,
);
doNothingTool.name = "doNothing";

class Chat {
  @(p`r:chat`) a: "chat";
  @(p`r${`
The message to send to them in the chat. You should NEVER mention other assistants, or inform the user you will transfer
to another assistant. If you will transfer the call to another assistant just use the transfer tool without saying
anything beforehand.`}`)
  text: string;
}
const chatTool = tool(
  {
    lambda: "",
    description:
      "Send a message to them in the chat. DO NOT USE THIS TOOL BEFORE USING THE TRANSFER TOOL.",
  },
  Chat,
);
chatTool.name = "chat";

class Transfer {
  @(p`r:transfer`) a: "transfer";
  @(p`r${"The name of the assistant to transfer to"}`)
  assistant: string;
}
const transferTool = tool(
  {
    lambda: "",
    description: `
Transfer to the specified assistant. If you are transfering to another assistant use this tool instead of any of the
other tools. NEVER talk to them before using this tool, just do it!`,
  },
  Transfer,
);
transferTool.name = "transfer";

let assists: Record<
  string,
  Assistant<Tool<any>[], Assistant<Tool<any>[], any>[]>
>;
const assistants = () => {
  if (!assists) {
    assists = (globalThis as any).assistants || {};
    if (!Object.keys(assists).length) {
      const assistantsFolder = path.resolve(__dirname, "../../ai/assistants");
      for (const assistantFile of fs.readdirSync(assistantsFolder)) {
        const name = assistantFile.substring(0, assistantFile.lastIndexOf("."));
        assists[name] = require(`ai/assistants/${name}`).default;
      }
    }
  }
  return assists;
};

const tools = () => [
  ...new Set(Object.values(assistants()).flatMap((a) => a.tools)),
  doNothingTool,
  chatTool,
  transferTool,
];

export const sendMessage = async (
  assistant: string,
  variables: Record<string, any>,
  message: string | ImageMessage,
  respond = false,
  doNothing = !respond,
  webSearch = false,
  model?: ChatModel,
  background?: boolean,
) => {
  const assist = assistants()[assistant];
  const canTransferTo = assist
    .canTransferTo()
    // signup only available in the chat, with response = true
    .filter((t) => respond || !t.name.startsWith("signup"));
  const assistantTransferTool = {
    ...transferTool,
    schema: {
      ...transferTool.schema,
      properties: {
        ...transferTool.schema.properties,
        assistant: {
          type: "string",
          description:
            `
The name of the assistant to transfer to. These are the assistants you can transfer to:` +
            canTransferTo
              .map(
                (t) => `
  - ${t.name}: ${t.description.replace(
    /\n/g,
    `
    `,
  )}`,
              )
              .join(""),
          enum: canTransferTo.map((t) => t.name),
        },
      },
    },
  };
  const tools = [
    assistantTransferTool,
    ...(respond ? [chatTool] : (doNothing && [doNothingTool]) || []),
    ...assist.tools,
  ];
  let instructions = assist
    .prompt(
      webSearch ? "" : extraInstructions(respond, assist.nonConversational),
    )
    .replace("{{now}}", variables.now || new Date().toISOString());
  for (const key in variables) {
    instructions = instructions.replace(
      `{{${key}}}`,
      variables[key] ?? `(you do not know their ${key})`,
    );
  }

  return (
    (webSearch &&
      run({
        instructions,
        input: message,
        tools,
        model: model || DEFAULT_WEB_SEARCH_MODEL,
        webSearch: true,
        background,
      })) ||
    (typeof message === "string" &&
      run({
        instructions,
        input: message,
        tools,
        model: model || DEFAULT_MODEL,
        background,
      })) ||
    run({
      instructions,
      input: message,
      tools,
      model: model || DEFAULT_WEB_TASK_MODEL,
      background,
    })
  );
};

const getApiUrl = (lambda: string) =>
  (process.env.NODE_ENV === "development" || process.env.IS_OFFLINE) &&
  !process.env.AWS_API
    ? `http://localhost:3000/dev/${lambda}`
    : lambdas[lambda];

export type WebAction =
  | ObserveResult
  | { click: string }
  | { type: string; into: string; submit: boolean }
  | { failed: boolean; result: string }
  | { go: "back" };

export const runAgent = async (
  assistant: string,
  variables: Record<string, any>,
  message: string | ImageMessage,
  response: { response: string; webTaskId: string } | WebAction[] | undefined,
  respond = !response,
) => {
  let action = await sendMessage(
    assistant,
    {
      ...variables,
      history:
        variables.history?.substring(0, variables.history.lastIndexOf("\n")) ||
        "",
    },
    message,
    response && !(response instanceof Array),
    respond,
  );
  console.log("action", JSON.stringify(action, null, 2));

  let reason = "";
  let newHistory = variables.history || "";
  while (action) {
    const tool = tools().find((t) => t.name === action.a);
    if (!tool) {
      newHistory +=
        "\n" + new Date().toISOString() + ": unknown " + action.a + " tool";
    } else if (tool.lambda) {
      const params = { ...action };
      delete params.a;
      newHistory +=
        "\n" +
        new Date().toISOString() +
        ": " +
        tool.name +
        " used with params " +
        JSON.stringify(params);
      try {
        const toolResponse = await axios.post(getApiUrl(tool.lambda), {
          signature: sign({
            ...(variables.phone ? { phone: variables.phone } : {}),
            ...(variables.email ? { email: variables.email } : {}),
          }),
          ...params,
        });
        newHistory +=
          "\n" +
          new Date().toISOString() +
          ": tool " +
          tool.name +
          " responded with " +
          JSON.stringify(toolResponse.data);
        if (tool.name === "createWebTask") {
          (response as { webTaskId: string }).webTaskId = toolResponse.data;
        }
      } catch (e) {
        console.error(e);
        newHistory +=
          "\n" +
          new Date().toISOString() +
          ": " +
          tool.name +
          " tool had error with params: " +
          JSON.stringify(params);
      }
    } else if (tool.name === "transfer") {
      assistant = action.assistant;
      newHistory +=
        "\n" +
        new Date().toISOString() +
        ": transferred to " +
        assistant +
        " assistant";
    } else if (response instanceof Array) {
      const { reasoning } = action;
      reason = reasoning;
      if (tool.name === "webClick") {
        if (action.id !== null) {
          response.push({
            method: "click",
            selector: action.id,
            description: "click on " + action.element,
          });
        } else {
          response.push({
            click: action.element,
          });
        }
      } else if (tool.name === "webType") {
        if (action.id !== null) {
          response.push({
            method: "click",
            selector: action.id,
            description: "click on " + action.element,
          });
          response.push({
            method: "type",
            selector: action.id,
            description: "type " + action.text + " into " + action.element,
            arguments: [action.text],
          });
          if (action.submit) {
            response.push({
              method: "press",
              selector: action.id,
              description: "press enter",
              arguments: ["Enter"],
            });
          }
        } else {
          response.push({
            type: action.text,
            into: action.element,
            submit: !!action.submit,
          });
        }
      } else if (tool.name === "webScroll") {
        response.push({
          method: action.direction === "down" ? "nextChunk" : "prevChunk",
          selector: action.id,
          description: "scroll " + action.element + " " + action.direction,
        });
      } else if (tool.name === "webResult") {
        response.push({
          failed: action.failed,
          result: action.result,
        });
      } else if (tool.name === "webGoBack") {
        response.push({
          go: "back",
        });
      } else {
        newHistory +=
          "\n" +
          new Date().toISOString() +
          ": tried to use " +
          tool.name +
          " tool, but couldn't";
      }
    } else if (action.text) {
      (response as { response: string }).response = action.text;
      newHistory +=
        "\n" +
        new Date().toISOString() +
        ": sent message: " +
        JSON.stringify(action.text);
      break;
    } else if (tool.name !== "doNothing") {
      newHistory +=
        "\n" +
        new Date().toISOString() +
        ": tried to use " +
        tool.name +
        " tool, but couldn't";
    } else {
      break;
    }
    if (response && !(response instanceof Array)) {
      action = await sendMessage(
        assistant,
        {
          ...variables,
          history: newHistory.substring(0, newHistory.lastIndexOf("\n")),
        },
        newHistory.substring(newHistory.lastIndexOf("\n") + 1),
        true,
      );
      console.log("action", JSON.stringify(action, null, 2));
    } else {
      break;
    }
  }
  return {
    assistant,
    newHistory: reason
      ? newHistory.replace(/\n\n.*\n\n/g, "") +
        "\n\nReasoning: " +
        reason +
        "\n\n"
      : newHistory,
  };
};

const extraInstructions = (respond: boolean, nonConversational: boolean) =>
  /* md */ `
# Context

- You need to decide what to do next based on the history and the new message.
- You will respond with a JSON corresponding to the next tool you want to use.
- You can only use one tool at a time, and you have multiple tools to choose from.
- The order of the tools in the schema do not mean anything, you can use them in any order to follow your instructions.` +
  ((!nonConversational &&
    (!respond
      ? /* md */ `
- The sign up process can only be done by phone or on the website.
- If you have their phone number you should use the triggerCall tool to call them. If they ask you to call
  at a specific time in the future you should use the schedule tool first, and then the triggerCall tool when
  that time comes.
- Only if you do not have their phone number:
  - If they show interest in signing up, you should ask for their phone number so you can call them first. If you already
    have their phone number you should just use the triggerCall tool.
  - If they do not show interest in signing up, you should say you can only help them if they sign up.
- Do not confuse your own phone number with their phone number. You should NEVER call yourself.
- If you receive an e-mail you should use the sendEmail tool to reply to it, unless they allow you to call them and
  you have their phone number.`
      : /* md */ `
- You are currently talking to them over chat.
- Any time you want to say anything to them you should use the chat tool!`)) ||
    "");
