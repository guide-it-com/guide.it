import { paramsToPath, pathToParams } from "./pages";
import {
  paramsWithArray,
  paramsWithOptionalEmptyArray,
  paramsWithoutVariables,
  paramsWithVariable,
  paramsWithVariableArray,
  pathWithArray,
  pathWithoutVariables,
  pathWithVariable,
  routeWithArray,
  routeWithOptionalArray,
  routeWithoutVariables,
  routeWithVariable,
} from "./samples/pages";

describe("pathToParams", () => {
  it("converts path without variables", () => {
    const params = pathToParams(routeWithoutVariables, pathWithoutVariables);
    expect(params).toEqual(paramsWithoutVariables);
  });
  it("rejects unmatched path with variables", () => {
    const params = pathToParams(routeWithoutVariables, pathWithVariable);
    expect(params).toBeUndefined();
  });
  it("converts path with variable", () => {
    const params = pathToParams(routeWithVariable, pathWithVariable);
    expect(params).toEqual(paramsWithVariable);
  });
  it("rejects unmatched path without variable", () => {
    const params = pathToParams(routeWithVariable, pathWithoutVariables);
    expect(params).toBeUndefined();
  });
  it("rejects unmatched path with array", () => {
    const params = pathToParams(routeWithVariable, pathWithArray);
    expect(params).toBeUndefined();
  });
  it("converts array path with variable", () => {
    const params = pathToParams(routeWithArray, pathWithVariable);
    expect(params).toEqual(paramsWithVariableArray);
  });
  it("converts array path", () => {
    const params = pathToParams(routeWithArray, pathWithArray);
    expect(params).toEqual(paramsWithArray);
  });
  it("rejects unmatched array path without variable", () => {
    const params = pathToParams(routeWithArray, pathWithoutVariables);
    expect(params).toBeUndefined();
  });
  it("converts optional array path without variables", () => {
    const params = pathToParams(routeWithOptionalArray, pathWithoutVariables);
    expect(params).toEqual(paramsWithOptionalEmptyArray);
  });
  it("converts optional array path with variable", () => {
    const params = pathToParams(routeWithOptionalArray, pathWithVariable);
    expect(params).toEqual(paramsWithVariableArray);
  });
  it("converts optional array path", () => {
    const params = pathToParams(routeWithOptionalArray, pathWithArray);
    expect(params).toEqual(paramsWithArray);
  });
});

describe("paramsToPath", () => {
  it("converts params to path", () => {
    const path = paramsToPath(routeWithoutVariables, paramsWithoutVariables);
    expect(path).toEqual(pathWithoutVariables);
  });
  it("converts params to path with variable", () => {
    const path = paramsToPath(routeWithVariable, paramsWithVariable);
    expect(path).toEqual(pathWithVariable);
  });
  it("converts params to array path with variable", () => {
    const path = paramsToPath(routeWithArray, paramsWithVariableArray);
    expect(path).toEqual(pathWithVariable);
  });
  it("converts params to array path", () => {
    const path = paramsToPath(routeWithArray, paramsWithArray);
    expect(path).toEqual(pathWithArray);
  });
  it("converts params to optional array path without variables", () => {
    const path = paramsToPath(
      routeWithOptionalArray,
      paramsWithOptionalEmptyArray,
    );
    expect(path).toEqual(pathWithoutVariables);
  });
  it("converts params to optional array path with variable", () => {
    const path = paramsToPath(routeWithOptionalArray, paramsWithVariableArray);
    expect(path).toEqual(pathWithVariable);
  });
  it("converts params to optional array path", () => {
    const path = paramsToPath(routeWithOptionalArray, paramsWithArray);
    expect(path).toEqual(pathWithArray);
  });
});
