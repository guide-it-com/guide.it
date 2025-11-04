import { app, BrowserWindow, ipcMain } from "electron";
import serve from "electron-serve";
import { join } from "node:path";
import { readdirSync, existsSync } from "node:fs";
import { createRequire } from "node:module";

app.disableHardwareAcceleration();

const appServe = app.isPackaged
  ? serve({
      directory: join(import.meta.dirname, "../web"),
    })
  : null;

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: join(import.meta.dirname, "preload.js"),
    },
  });

  if (app.isPackaged) {
    win.setMenu(null);
    appServe(win).then(() => {
      win.loadURL("app://-");
    });
  } else {
    win.loadURL("http://localhost:3003");
    win.webContents.openDevTools();
    win.webContents.on("did-fail-load", () => {
      win.webContents.reloadIgnoringCache();
    });
  }
};

// Dynamically load API modules and set up IPC handlers
const setupAPIs = () => {
  const require = createRequire(import.meta.url);
  const apisDir = join(import.meta.dirname, "apis");

  if (existsSync(apisDir)) {
    const apis = readdirSync(apisDir);

    for (const api of apis) {
      const apiPath = join(apisDir, api);
      try {
        const apiModule = require(apiPath);
        for (const [functionName, func] of Object.entries(apiModule)) {
          if (typeof func === "function") {
            const channel = `api:${api}:${functionName}`;
            ipcMain.handle(channel, async (event, ...args) => {
              try {
                return await func(...args);
              } catch (error) {
                // eslint-disable-next-line no-undef
                console.error(`Error executing ${api}.${functionName}:`, error);
                throw error;
              }
            });
          }
        }
      } catch (error) {
        // eslint-disable-next-line no-undef
        console.error(`Error loading API module ${api}:`, error);
      }
    }
  }
};

app.on("ready", () => {
  setupAPIs();
  createWindow();
});

app.on("window-all-closed", () => {
  if (import.meta.platform !== "darwin") {
    app.quit();
  }
});
