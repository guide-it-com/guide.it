import { expectAssignable, expectError } from "tsd";
import { C, T } from "./samples/types";
import {
  Class,
  classToSchema,
  // @ts-ignore
  NamedProperties,
  // @ts-ignore
  NoFunctions,
  p,
  // @ts-ignore
  RecursivePartial,
} from "./types";

describe("Class", () => {
  it("should model a class", async () => {
    expectAssignable<Class>(C);
  });

  it("shouldn't model a regular type", async () => {
    expectError(
      // @ts-expect-error
      {} as T as Class,
    );
  });
});

describe("NamedProperties", () => {
  it("should filter only properties with specific names", async () => {
    expectError(
      // @ts-expect-error
      expectAssignable<NamedProperties<T>>({ a: "", b: 1, f: () => {}, c: 2 }), // "c" is not in T
    );
  });
});

describe("NoFunctions", () => {
  it("should remove properties with values of type Function", async () => {
    expectError(
      // @ts-expect-error
      expectAssignable<NoFunctions<T>>({ a: "", b: 1, f: () => {} }), // "f" is a function
    );
  });
});

describe("RecursivePartial", () => {
  it("should accept object without any properties", async () => {
    expectAssignable<RecursivePartial<C>>({});
  });

  it("should accept object without nested properties", async () => {
    expectAssignable<RecursivePartial<C>>({ nested: {} });
  });

  it("shouldn't accept object with wrong property type", async () => {
    expectError(
      // @ts-expect-error
      expectAssignable<RecursivePartial<C>>({ nested: "" }),
    );
  });

  it("shouldn't accept object with wrong nested property type", async () => {
    expectError(
      // @ts-expect-error
      expectAssignable<RecursivePartial<C>>({ nested: { prop: 1 } }),
    );
  });

  it("shouldn't accept object with unknown property", async () => {
    expectError(
      // @ts-expect-error
      expectAssignable<RecursivePartial<C>>({ unknown: "" }),
    );
  });
});

describe("p", () => {
  it("should be a property decorator", async () => {
    expectAssignable<PropertyDecorator>(p);
  });
  it("should create a property decorator with flags", async () => {
    expectAssignable<PropertyDecorator>(p`r`);
  });
});

describe("classToSchema", () => {
  it("should create a schema from a class", async () => {
    expect(classToSchema(C)).toEqual({
      type: "object",
      properties: {
        id: { type: "string" },
        prop: { type: "string" },
        nested: {
          type: "object",
          properties: {
            id: { type: "string" },
            prop: { type: "string" },
          },
          required: ["id"],
          additionalProperties: false,
        },
        array: { type: "array", items: { type: "string" } },
        nestedArray: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              prop: { type: "string" },
            },
            required: ["id"],
            additionalProperties: false,
          },
        },
      },
      required: ["id", "prop"],
      additionalProperties: false,
    });
  });
});
