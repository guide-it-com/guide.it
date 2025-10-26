import { Class, classToSchema } from "utils/types";

export type Tool<T> = {
  name: string;
  lambda: string;
  description: string;
  c: T;
  schema: any;
};

export const tool = <T>(
  {
    lambda,
    description,
  }: {
    lambda?: string;
    description: string;
  },
  c: Class<T>,
): Tool<Class<T>> => {
  const context = new Error().stack
    .split("\n")
    .filter((l) => l.includes("/"))[1]
    .replace(/\\/g, "/");
  const name = context.substring(context.lastIndexOf("/") + 1).split(".")[0];
  lambda = lambda ?? name;
  return {
    name,
    lambda,
    description,
    c,
    schema: classToSchema(c, description),
  };
};
