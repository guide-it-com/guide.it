import { defaultConfig } from "../../utils/lambda";
import type { AWS } from "@serverless/typescript";

const config: AWS["functions"][""] = {
  ...defaultConfig(),
  memorySize: 2048, // limit RAM to this number of MB
  timeout: 60, // destroy lambda instances that fail to respond for this number of seconds
};

export default config;
