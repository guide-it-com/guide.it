/**
 * @type {import('next').NextConfig}
 */
const withWebpack = {
  webpack(config) {
    if (!config.resolve) {
      config.resolve = {};
    }

    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "react-native": "react-native-web",
      "react-native$": "react-native-web",
      "react-native/Libraries/EventEmitter/RCTDeviceEventEmitter$":
        "react-native-web/dist/vendor/react-native/NativeEventEmitter/RCTDeviceEventEmitter",
      "react-native/Libraries/vendor/emitter/EventEmitter$":
        "react-native-web/dist/vendor/react-native/emitter/EventEmitter",
      "react-native/Libraries/EventEmitter/NativeEventEmitter$":
        "react-native-web/dist/vendor/react-native/NativeEventEmitter",
      react$: "frontend/.react",
      "react/jsx-runtime$": "frontend/.react/jsx-runtime",
      "react-dom$": "frontend/.react/dom",
    };

    config.resolve.extensions = [
      ".web.js",
      ".web.jsx",
      ".web.ts",
      ".web.tsx",
      ...(config.resolve?.extensions ?? []),
    ];

    return config;
  },
};

/**
 * @type {import('next').NextConfig}
 */
const withTurpopack = {
  turbopack: {
    resolveAlias: {
      "react-native": "react-native-web",
      "react-native/Libraries/EventEmitter/RCTDeviceEventEmitter$":
        "react-native-web/dist/vendor/react-native/NativeEventEmitter/RCTDeviceEventEmitter",
      "react-native/Libraries/vendor/emitter/EventEmitter$":
        "react-native-web/dist/vendor/react-native/emitter/EventEmitter",
      "react-native/Libraries/EventEmitter/NativeEventEmitter$":
        "react-native-web/dist/vendor/react-native/NativeEventEmitter",
    },
    resolveExtensions: [
      ".web.js",
      ".web.jsx",
      ".web.ts",
      ".web.tsx",

      ".js",
      ".mjs",
      ".tsx",
      ".ts",
      ".jsx",
      ".json",
      ".wasm",
    ],
  },
};

/**
 * @type {import('next').NextConfig}
 */
// eslint-disable-next-line no-undef
module.exports = {
  transpilePackages: [
    "react-native",
    "react-native-web",
    "solito",
    "react-native-gesture-handler",
    "@rn-primitives",
  ],

  compiler: {
    styledComponents: true,
    define: {
      // eslint-disable-next-line no-undef
      __DEV__: JSON.stringify(process.env.NODE_ENV !== "production"),
    },
  },
  reactStrictMode: false, // reanimated doesn't support this on web

  ...withWebpack,
  ...withTurpopack,
};
