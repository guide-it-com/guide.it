import { cleanObject } from "./objects";
import { cleaned, obj } from "./samples/objects";

describe("cleanObject", () => {
  it("should clean an object", () => {
    const cleanedObj = cleanObject(obj);
    expect(cleanedObj).toBe(cleaned);
  });
});
