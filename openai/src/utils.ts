import { tool, Tool } from "ai/utils/tools";
import OpenAI from "original-openai";
import { ChatModel } from "original-openai/resources";
import { tryJsonParse } from "utils/strings";
import { Class, p } from "utils/types";

export type { ChatModel };

const client = new OpenAI();

export type ImageMessage = [
  {
    role: "user";
    content: [
      {
        type: "input_image";
        detail: "high";
        image_url: string;
      },
      {
        type: "input_text";
        text: string;
      },
    ];
  },
];

export const run = async <T extends Class<any> = Class<string>>({
  instructions,
  input,
  tools = [String] as any,
  model = "gpt-4.1-nano",
  webSearch = false,
  background = false,
}: {
  instructions: string;
  input: string | ImageMessage;
  tools?: Tool<T>[];
  model?: ChatModel;
  webSearch?: boolean;
  background?: boolean;
}) => {
  const response = await client.responses.create({
    model,
    instructions,
    input,
    background,
    ...(webSearch
      ? {
          tools: [{ type: "web_search_preview" }],
        }
      : {}),
    // in test mode, set temperature to 0
    ...(process.env.NODE_ENV === "test" ? { temperature: 0 } : {}),
    text: {
      format:
        tools.length === 1 && tools[0] === (String as any)
          ? {
              type: "text",
            }
          : {
              name: "response",
              type: "json_schema",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  i:
                    tools.length === 1
                      ? tools[0].schema
                      : {
                          anyOf: tools.map(({ name, schema }) => ({
                            ...schema,
                            properties: {
                              a: {
                                type: "string",
                                const: name,
                              },
                              ...schema.properties,
                            },
                            required: schema.required
                              ? (schema.required.includes("a") &&
                                  schema.required) || ["a", ...schema.required]
                              : ["a"],
                          })),
                        },
                },
                required: ["i"],
                additionalProperties: false,
              },
            },
    },
  });

  return (
    (background && (response.id as any as InstanceType<T>)) ||
    (tools.length === 1 && tools[0] === (String as any)
      ? (response.output_text as any as InstanceType<T>)
      : (tryJsonParse(response.output_text).i as InstanceType<T>))
  );
};

export const getResult = async (responseId: string) => {
  const response = await client.responses.retrieve(responseId);
  return {
    pending:
      ["queued", "in_progress"].includes(response.status) ||
      response.error?.message?.includes("retry your request"),
    status: response.status,
    createdAt: new Date(response.created_at * 1000).toISOString(),
    error: response.error,
    output: response.output_text,
  };
};

class Assert {
  @(p`r${"The result of the assertion"}`) result: boolean;
  @(p`r${"The message to return if the assertion is false"}`) message: string;
}

export const aiAssert = async (instructions: string, input: string) => {
  const result = await run({
    instructions:
      "Your only job is to check if the following conditions are met, and return an error if they are not: " +
      instructions +
      ". Message can be an empty string if there is no error.",
    input,
    tools: [tool({ lambda: "", description: "Assert" }, Assert)],
  });
  if (!result.result) {
    throw new Error(result.message);
  } else if (result.message) {
    console.log(result.message);
  }
};
