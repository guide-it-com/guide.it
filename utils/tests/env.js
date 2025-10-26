const NodeEnvironment = require("jest-environment-node");

module.exports = class FixNodeEnvironment extends NodeEnvironment {
  constructor(...args) {
    super(...args);
    this.global.fetch = fetch;
    this.global.Request = Request;
    this.global.Response = Response;
    this.global.Headers = Headers;
    this.global.AbortController = AbortController;
    this.global.AbortSignal = AbortSignal;
    this.global.Blob = Blob;
    this.global.File = File;
    this.global.FormData = FormData;
    this.global.URL = URL;
    this.global.URLSearchParams = URLSearchParams;
    this.global.ReadableStream = ReadableStream;
    this.global.WritableStream = WritableStream;
    this.global.TransformStream = TransformStream;
    this.global.TextDecoder = TextDecoder;
    this.global.TextEncoder = TextEncoder;
    this.global.JSON = JSON;
    this.global.crypto = crypto;
    this.global.console = console;
    this.global.setTimeout = setTimeout;
    this.global.clearTimeout = clearTimeout;
    this.global.setInterval = setInterval;
    this.global.clearInterval = clearInterval;
    this.global.performance = performance;
  }
};
