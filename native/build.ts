import { readdirSync, statSync, writeFileSync } from "fs";

const pages: string[] = [];
const initialFolder = "../web/src/pages";
const folders = [initialFolder];
let folder: string;
while ((folder = folders.shift())) {
  for (const item of readdirSync(folder)) {
    if (item.startsWith("_")) {
      continue;
    }
    const info = statSync(`${folder}/${item}`);
    if (info.isDirectory()) {
      folders.push(`${folder}/${item}`);
    } else if (item.endsWith(".tsx")) {
      if (item === "index.tsx") {
        pages.push(folder.substring(initialFolder.length + 1));
      } else {
        pages.push(
          `${folder}/${item.substring(0, item.length - 4)}`.substring(
            initialFolder.length + 1,
          ),
        );
      }
    }
  }
}

writeFileSync(
  "pages.ts",
  "export default {" +
    pages
      .map(
        (page) => `
          ["${page}"]: require("frontend/pages${page && "/" + page}").default,
        `,
      )
      .join("") +
    "};",
);
