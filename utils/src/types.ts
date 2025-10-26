import "reflect-metadata";

// simple type for classes
export type Class<T = any> = new (...args: any[]) => T;

// simple class for arrays
export class ArrayClass<T> extends Array<T> {
  "0": T;
}

// filter only properties with specific names
export type NamedProperties<T> = {
  [K in keyof T as string extends K ? never : K]: T[K];
};

// remove properties with values of type Function
export type NoFunctions<T> = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  [K in keyof NamedProperties<T> as T[K] extends Function
    ? never
    : K]: T[K] extends Class ? NoFunctions<T[K]> : T[K];
};

export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object | undefined
      ? RecursivePartial<T[P]>
      : T[P];
};

const properties: Map<any, Record<string, any>> = new Map();
const descriptions: Map<any, Record<string, string>> = new Map();
const required: Map<any, string[]> = new Map();

export function p(
  flags: TemplateStringsArray,
  description?: string,
): PropertyDecorator;
export function p(c: any, k: any): void;
export function p(...args: any[]) {
  let flags = "";
  if (args[0] instanceof Array) {
    flags = args[0][0];
  }
  const decorator = (c: any, k: any) => {
    if (!properties.has(c.constructor)) {
      properties.set(c.constructor, {});
      required.set(c.constructor, []);
    }
    properties.get(c.constructor)![k] =
      flags?.split(":").length > 1
        ? flags.split(":").slice(1)
        : Reflect.getMetadata("design:type", c, k);
    if (flags?.split(":")[0].includes("r")) {
      required.get(c.constructor)!.push(k);
    }
    if (!descriptions.has(c.constructor)) {
      descriptions.set(c.constructor, {});
    }
    if (args[0] instanceof Array) {
      descriptions.get(c.constructor)![k] = args[1];
    }
  };
  if (flags) {
    return decorator;
  }
  return decorator.call(null, ...(args as [any, any]));
}

const anyToSchema = (t: any, d?: string) => {
  if (properties.has(t)) {
    return classToSchema(t, d);
  }
  if (t instanceof Array) {
    return {
      type: "string",
      ...(t.length > 1 ? { enum: t } : { const: t[0] }),
      ...(d ? { description: d } : {}),
    };
  }
  return {
    type:
      (t === String && "string") ||
      (t === Number && "number") ||
      (t === Boolean && "boolean") ||
      "any",
    ...(d ? { description: d } : {}),
  };
};

export const classToSchema = (c: Class, d?: string) => {
  const props = properties.get(c) || {};
  const schema: any = {
    type: "object",
    ...(d ? { description: d } : {}),
    properties: {},
    additionalProperties: false,
  };
  const req = required.get(c);
  schema.required = [];
  for (const [k, t] of Object.entries(props)) {
    if (
      typeof t !== "string" &&
      !(t instanceof Array) &&
      new t() instanceof ArrayClass
    ) {
      schema.properties[k] = {
        type: "array",
        ...(descriptions.get(c)![k]
          ? { description: descriptions.get(c)![k] }
          : {}),
        items: anyToSchema(properties.get(t)!["0"], descriptions.get(t)!["0"]),
      };
    } else {
      schema.properties[k] = anyToSchema(t, descriptions.get(c)![k]);
    }
    schema.required.push(k);
    if (!req?.includes(k)) {
      schema.properties[k].type = [schema.properties[k].type, "null"];
    }
  }
  return schema;
};
