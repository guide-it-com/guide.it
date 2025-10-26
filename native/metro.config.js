// Learn more https://docs.expo.dev/guides/monorepos
// Learn more https://docs.expo.io/guides/customizing-metro
/**
 * @type {import('expo/metro-config')}
 */
const { getDefaultConfig } = require("expo/metro-config");
const fs = require("fs");
const path = require("path");

const rnwPath = fs.realpathSync(
  path.resolve(require.resolve("react-native-windows/package.json"), ".."),
);

const projectRoot = __dirname;
const frontendRoot = path.resolve(projectRoot, "../web/src");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [projectRoot, frontendRoot];
if (!(config.resolver.blockList instanceof Array)) {
  config.resolver.blockList = config.resolver.blockList
    ? [config.resolver.blockList]
    : [];
}
config.resolver.blockList.push(
  // This stops "npx @react-native-community/cli run-windows" from causing the metro server to crash if its already running
  new RegExp(`${path.resolve(__dirname, "windows").replace(/[/\\]/g, "/")}.*`),
  // This prevents "npx @react-native-community/cli run-windows" from hitting: EBUSY: resource busy or locked, open msbuild.ProjectImports.zip or other files produced by msbuild
  new RegExp(`${rnwPath}/build/.*`),
  new RegExp(`${rnwPath}/target/.*`),
  /.*\.ProjectImports\.zip/,
);
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(frontendRoot, "node_modules"),
];
config.resolver.disableHierarchicalLookup = true;

config.transformer.getTransformOptions = () =>
  Promise.resolve({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  });

module.exports = config;
