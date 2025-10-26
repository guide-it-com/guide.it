export const routeWithoutVariables = "test";
export const pathWithoutVariables = "test";
export const paramsWithoutVariables = {} as const;

export const routeWithVariable = "test/[id]";
export const pathWithVariable = "test/123";
export const paramsWithVariable = {
  id: "123",
} as const;

export const routeWithMultipleVariables = "test/[id]/[name]";
export const pathWithMultipleVariables = "test/123/John";
export const paramsWithMultipleVariables = {
  id: "123",
  name: "John",
};

export const routeWithArray = "test/[...array]";
export const pathWithArray = "test/123/456";
export const paramsWithVariableArray = {
  array: ["123"],
};
export const paramsWithArray = {
  array: ["123", "456"],
};

export const routeWithOptionalArray = "test/[[...array]]";
export const paramsWithOptionalEmptyArray = {
  array: undefined,
};
