import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";

const lambdas = process.env.LAMBDAS || "lambdas";
if (lambdas !== "lambdas" || process.env.LAMBDA) {
  process.exit(0);
}
const lambdaNames = fs.readdirSync(path.join(__dirname, lambdas));

Promise.all(
  lambdaNames.map(async (lambdaName) => {
    const url = spawnSync("yarn", ["url", lambdaName]).stdout.toString().trim();
    return [lambdaName, url];
  }),
).then((results) => {
  const urls = Object.fromEntries(results);
  fs.writeFileSync(
    path.resolve(__dirname, "../utils/src/lambdas.json"),
    JSON.stringify(urls, null, 2),
  );
});
