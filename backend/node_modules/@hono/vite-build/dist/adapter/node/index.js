import buildPlugin from "../../base.js";
import { serveStaticHook } from "../../entry/serve-static.js";
const nodeBuildPlugin = (pluginOptions) => {
  const port = pluginOptions?.port ?? 3e3;
  return {
    ...buildPlugin({
      ...{
        entryContentBeforeHooks: [
          async (appName, options) => {
            let code = "import { serveStatic } from '@hono/node-server/serve-static'\n";
            code += serveStaticHook(appName, {
              filePaths: options?.staticPaths,
              root: pluginOptions?.staticRoot
            });
            return code;
          }
        ],
        entryContentAfterHooks: [
          async (appName) => {
            let code = "import { serve } from '@hono/node-server'\n";
            code += `serve({ fetch: ${appName}.fetch, port: ${port.toString()} })`;
            return code;
          }
        ]
      },
      ...pluginOptions
    }),
    name: "@hono/vite-build/node"
  };
};
var node_default = nodeBuildPlugin;
export {
  node_default as default
};
