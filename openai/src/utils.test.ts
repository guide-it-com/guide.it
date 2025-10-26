import { resultTool } from "./samples/utils";
import { aiAssert, run } from "./utils";

describe("run", () => {
  it("should return a string by default", async () => {
    const result = await run({
      instructions: "Be a helpful assistant",
      input: "Hello!",
    });
    expect(typeof result).toBe("string");
  });

  it("should return an object if there is a tool", async () => {
    const result = await run({
      instructions:
        "Your job is to check if the input is a number, and nothing else. If the input is not a number, return an error.",
      input: "Hello!",
      tools: [resultTool],
    });
    expect(typeof result).toBe("object");
  });

  it("should be able to perform generic assertions", async () => {
    const stringResult = await run({
      instructions:
        "Your job is to check if the input is a number, and nothing else. If the input is not a number, return an error.",
      input: "Hello!",
      tools: [resultTool],
    });
    expect(stringResult.error).toBe(true);

    const numberResult = await run({
      instructions:
        "Your job is to check if the input is a number, and nothing else. If the input is not a number, return an error.",
      input: "123",
      tools: [resultTool],
    });
    expect(numberResult.error).toBe(false);
  });
});

describe("aiAssert", () => {
  it("should not throw an error if the assertion passes", async () => {
    await aiAssert("If the input is not a number, throw an error.", "123");
  });

  it("should throw an error if the assertion fails", async () => {
    await expect(
      aiAssert("If the input is not a number, throw an error.", "Hello!"),
    ).rejects.toThrow();
  });
});
