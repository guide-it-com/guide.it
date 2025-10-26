import type { AWS } from "@serverless/typescript";
import fs from "fs";
import path from "path";
import request from "sync-request";

const devIpResponse = request("GET", "https://api.ipify.org/?format=json");

const lambdas = process.env.LAMBDAS || "lambdas";
const functions = Object.fromEntries(
  fs
    .readdirSync(path.join(__dirname, lambdas))
    .filter(
      (lambda) =>
        !process.env.LAMBDA || process.env.LAMBDA.split(",").includes(lambda),
    )
    .map((lambda) => [
      lambda,
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require(`./${lambdas}/${lambda}/config`).default,
    ]),
);

const serverlessConfiguration: AWS = {
  service: "backend",
  frameworkVersion: "3",
  plugins: [
    "serverless-esbuild",
    "serverless-plugin-common-excludes",
    "serverless-offline",
    "serverless-offline-lambda-function-urls",
    "serverless-dotenv-plugin",
  ],
  provider: {
    name: "aws",
    region: "sa-east-1",
    runtime: "nodejs22.x",
    endpointType: "EDGE",
    environment: {
      ...(process.env.npm_lifecycle_event === "start"
        ? process.env
        : Object.fromEntries(
            Object.entries(process.env)
              .filter(([key]) => key.startsWith("AWS_"))
              .map(([key, value]) => [key.substring(4), value]),
          )),
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
      DEV_IP: JSON.parse(devIpResponse.body as string).ip,
    },
  },
  functions,
  package: { individually: true },
  custom: {
    dotenv: {
      path: ".env",
    },
    esbuild: {
      bundle: true,
      minify: true,
      keepNames: true,
      sourcemap: true,
      skipRebuild: !process.env.LAMBDA,
      exclude: [],
      target: "node22",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
      plugins: "esbuild-plugins.ts",
      external: [
        "@browserbasehq/stagehand",
        "@midscene/shared",
        "playwright",
        "playwright-core",
        "thread-stream",
        "twilio",
      ],
    },
    "serverless-offline": {
      host: "localhost",
      urlLambdaFunctionsHttpVerbs: ["POST"],
    },
  },
};

module.exports = serverlessConfiguration;
