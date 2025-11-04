// eslint-disable-next-line @typescript-eslint/no-require-imports, no-undef
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronInvoke", (channel, ...args) => {
  return ipcRenderer.invoke(channel, ...args);
});

contextBridge.executeInMainWorld({
  func: () => {
    // eslint-disable-next-line no-undef
    window.api = new Proxy(
      {},
      {
        get: (target, apiName) => {
          return new Proxy(
            {},
            {
              get: (innerTarget, functionName) => {
                return (...args) =>
                  // eslint-disable-next-line no-undef
                  window.electronInvoke(
                    `api:${String(apiName)}:${String(functionName)}`,
                    ...args,
                  );
              },
            },
          );
        },
      },
    );
  },
});
