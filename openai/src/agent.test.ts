import { sendMessage } from "./agent";

describe("sendMessage", () => {
  it("should schedule", async () => {
    const action = await sendMessage(
      "welcome",
      { history: "There is no history with them" },
      "Can you call me back in 5 minutes?",
      false,
      false,
    );
    expect(action.a).toBe("schedule");
  });

  it("should trigger a call", async () => {
    const action = await sendMessage(
      "welcome",
      {
        phone: "+1234567890",
        history: "They asked to be called at 2025-03-25T10:00:00.000Z",
        now: "2025-03-25T10:00:00.000Z",
      },
      "(it is now 2025-03-25T10:00:00.000Z)",
      false,
      false,
    );
    expect(action.a).toBe("triggerCall");
    expect((action as any).phone).toBe("+1234567890");
    expect((action as any).optOut).not.toBe(true);
  });
});
