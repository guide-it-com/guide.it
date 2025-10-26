const chokidar = require("chokidar");
const path = require("path");

let updateConfigAndRun;
let lastFileChanged;
let triggerInterval;

const root = path.resolve(__dirname, "../..");

chokidar
  .watch(root, {
    ignored: /node_modules|\.tmp/,
  })
  .on("change", (f) => {
    lastFileChanged = f;
    clearInterval(triggerInterval);
    triggerInterval = setInterval(() => {
      if (!updateConfigAndRun) {
        return;
      }
      clearInterval(triggerInterval);
      updateConfigAndRun({
        findRelatedTests: true,
        testPathPattern: lastFileChanged,
        nonFlagArgs: [lastFileChanged],
      });
      lastFileChanged = undefined;
    }, 1000);
  });

class RelatedWatchPlugin {
  apply(jestHooks) {
    jestHooks.onFileChange(() => {
      if (updateConfigAndRun && lastFileChanged) {
        clearInterval(triggerInterval);
        updateConfigAndRun({
          findRelatedTests: true,
          testPathPattern: lastFileChanged,
          nonFlagArgs: [lastFileChanged],
        });
        lastFileChanged = undefined;
      }
    });

    jestHooks.shouldRunTestSuite(() => {
      return !!updateConfigAndRun;
    });
  }
  getUsageInfo() {
    return {
      key: "n",
      prompt: "related to fs changes",
    };
  }
  run(_, updateAndRun) {
    updateConfigAndRun = updateAndRun;
    return Promise.resolve(false);
  }
}

module.exports = RelatedWatchPlugin;
