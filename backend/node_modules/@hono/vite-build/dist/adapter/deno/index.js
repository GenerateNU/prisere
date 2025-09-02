import buildPlugin from "../../base.js";
import { serveStaticHook } from "../../entry/serve-static.js";
const denoBuildPlugin = (pluginOptions) => {
  return {
    ...buildPlugin({
      ...{
        entryContentBeforeHooks: [
          async (appName, options) => {
            let code = "import { serveStatic } from 'hono/deno'\n";
            code += serveStaticHook(appName, {
              filePaths: options?.staticPaths,
              root: pluginOptions?.staticRoot
            });
            return code;
          }
        ]
      },
      ...pluginOptions
    }),
    name: "@hono/vite-build/deno"
  };
};
var deno_default = denoBuildPlugin;
export {
  deno_default as default
};
