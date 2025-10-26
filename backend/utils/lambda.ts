import { configDotenv } from "dotenv";

configDotenv({ path: ".env" });

export const defaultConfig = () => {
  let context = new Error().stack
    .split("\n")[2]
    .split("(")[1]
    .replace(/\\/g, "/");
  context = context
    .substring(0, context.lastIndexOf("/"))
    .split(process.cwd().replace(/\\/g, "/"))[1];
  return {
    name: context.split("/")[2],
    handler: `${context.substring(1)}/index.handler`,
    url: true,
  };
};
