import buildPlugin from "../../base.js";
import { serveStaticHook } from "../../entry/serve-static.js";
const bunBuildPlugin = (pluginOptions) => {
  return {
    ...buildPlugin({
      ...{
        entryContentBeforeHooks: [
          async (appName, options) => {
            let code = "import { serveStatic } from 'hono/bun'\n";
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
    name: "@hono/vite-build/bun"
  };
};
var bun_default = bunBuildPlugin;
export {
  bun_default as default
};
