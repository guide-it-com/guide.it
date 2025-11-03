import { app, BrowserWindow } from "electron";
import serve from "electron-serve";
import { join } from "node:path";

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

app.on("ready", () => {
  createWindow();
});

app.on("window-all-closed", () => {
  if (import.meta.platform !== "darwin") {
    app.quit();
  }
});
