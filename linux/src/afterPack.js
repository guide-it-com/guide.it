import { promises as fs } from "node:fs";
import { join } from "node:path";

/**
 * Workaround for https://github.com/electron-userland/electron-builder/issues/5371
 *
 * use as "afterPack": "./linux-sandbox-fix.js" in build section of package.json
 */
async function afterPack({ appOutDir, electronPlatformName, packager }) {
  if (electronPlatformName !== "linux") {
    return;
  }

  const appName = packager.appInfo.productFilename;
  const script = `#!/bin/bash\n"\${BASH_SOURCE%/*}"/${appName}.bin --no-sandbox "$@"`;
  const scriptPath = join(appOutDir, appName);

  await fs.rename(scriptPath, `${scriptPath}.bin`);
  await fs.writeFile(scriptPath, script);
  await fs.chmod(scriptPath, 0o755);
}

export default afterPack;
