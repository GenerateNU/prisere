"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var cloudflare_exports = {};
__export(cloudflare_exports, {
  cloudflareAdapter: () => cloudflareAdapter,
  default: () => cloudflare_default
});
module.exports = __toCommonJS(cloudflare_exports);
var import_miniflare = require("miniflare");
var import_wrangler = require("wrangler");
Object.assign(globalThis, { WebSocketPair: import_miniflare.WebSocketPair });
let proxy = void 0;
const cloudflareAdapter = async (options) => {
  proxy ??= await (0, import_wrangler.getPlatformProxy)(options?.proxy);
  Object.assign(globalThis, { caches: proxy.caches });
  if (typeof globalThis.navigator === "undefined") {
    globalThis.navigator = {
      userAgent: "Cloudflare-Workers"
    };
  } else {
    Object.defineProperty(globalThis.navigator, "userAgent", {
      value: "Cloudflare-Workers",
      writable: false
    });
  }
  Object.defineProperty(Request.prototype, "cf", {
    get: function() {
      if (proxy !== void 0) {
        return proxy.cf;
      }
      throw new Error("Proxy is not initialized");
    },
    configurable: true,
    enumerable: true
  });
  return {
    env: proxy.env,
    executionContext: proxy.ctx,
    onServerClose: async () => {
      if (proxy !== void 0) {
        try {
          await proxy.dispose();
        } catch {
        } finally {
          proxy = void 0;
        }
      }
    }
  };
};
var cloudflare_default = cloudflareAdapter;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  cloudflareAdapter
});
