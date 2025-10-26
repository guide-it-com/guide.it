module.exports = {
  testEnvironment: "node",
  moduleFileExtensions: ["js", "ts", "json"],
  transform: {
    "^.*\\.ts$": [require.resolve("jest-tsd-transform")],
  },
  testMatch: ["<rootDir>/**/*test.ts"],
  coverageReporters: [],
  resolver: require.resolve("jest-pnp-resolver"),
  watchPlugins: ["../utils/tests/watchplugin.js"],
};
