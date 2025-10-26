import { tool } from "ai/utils/tools";
import { p } from "utils/types";

export class Result {
  @(p`r`) message: string;
  @(p`r`) error: boolean;
}

export const resultTool = tool(
  {
    description: "Use this to return the result of an assertion",
  },
  Result,
);
