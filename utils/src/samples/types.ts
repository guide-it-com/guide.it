import { ArrayClass, p } from "../types";

export type T = {
  a: string;
  b: number;
  f: () => void;
  [key: string]: any;
};

class Nested {
  @(p`r`) id: string;
  @p prop: string;
}

class StringArray extends ArrayClass<string> {
  @p "0": string;
}

class NestedArray extends ArrayClass<Nested> {
  @p "0": Nested;
}

export class C {
  @(p`r`) id: string;
  @(p`r`) prop: string;
  @p nested: Nested;
  @p array: StringArray;
  @p nestedArray: NestedArray;
}
