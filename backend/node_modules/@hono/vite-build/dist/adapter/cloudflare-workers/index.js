import buildPlugin from "../../base.js";
const cloudflareWorkersBuildPlugin = (pluginOptions) => {
  return {
    ...buildPlugin({
      ...pluginOptions
    }),
    name: "@hono/vite-build/cloudflare-workers"
  };
};
var cloudflare_workers_default = cloudflareWorkersBuildPlugin;
export {
  cloudflare_workers_default as default
};
