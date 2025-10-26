import { getFirstGroupMatch, tryJsonParse } from "./strings";

describe("tryJsonParse", () => {
  it("should return the parsed JSON", () => {
    const result = tryJsonParse('{"name": "John", "age": 30}');
    expect(result).toEqual({ name: "John", age: 30 });
  });

  it("should return the original string if it is not a valid JSON", () => {
    const result = tryJsonParse("not a valid JSON");
    expect(result).toEqual(undefined);
  });
});

describe("getFirstGroupMatch", () => {
  it("should return the first group matched string from a RegExp", () => {
    const result = getFirstGroupMatch("name=John", /name=([^&]+)/);
    expect(result).toEqual("John");
  });

  it("should return an empty string if no match is found", () => {
    const result = getFirstGroupMatch("name=John", /age=([^&]+)/);
    expect(result).toEqual("");
  });
});
