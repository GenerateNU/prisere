import { WebSocketPair } from "miniflare";
import { getPlatformProxy } from "wrangler";
Object.assign(globalThis, { WebSocketPair });
let proxy = void 0;
const cloudflareAdapter = async (options) => {
  proxy ??= await getPlatformProxy(options?.proxy);
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
export {
  cloudflareAdapter,
  cloudflare_default as default
};
