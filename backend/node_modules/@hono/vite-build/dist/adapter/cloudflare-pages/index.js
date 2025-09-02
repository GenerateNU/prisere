import { readdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import buildPlugin, { defaultOptions } from "../../base.js";
const WORKER_JS_NAME = "_worker.js";
const ROUTES_JSON_NAME = "_routes.json";
const cloudflarePagesBuildPlugin = (pluginOptions) => {
  let config;
  const staticPaths = [];
  return {
    ...buildPlugin({
      ...pluginOptions,
      output: WORKER_JS_NAME
    }),
    configResolved: async (resolvedConfig) => {
      config = resolvedConfig;
    },
    writeBundle: async () => {
      const paths = await readdir(resolve(config.root, config.build.outDir), {
        withFileTypes: true
      });
      if (paths.some((p) => p.name === ROUTES_JSON_NAME)) {
        return;
      } else {
        paths.forEach((p) => {
          if (p.isDirectory()) {
            staticPaths.push(`/${p.name}/*`);
          } else {
            if (p.name === WORKER_JS_NAME) {
              return;
            }
            staticPaths.push(`/${p.name}`);
          }
        });
        const staticRoutes = {
          version: 1,
          include: ["/*"],
          exclude: staticPaths
        };
        const path = resolve(
          config.root,
          pluginOptions?.outputDir ?? defaultOptions.outputDir,
          "_routes.json"
        );
        await writeFile(path, JSON.stringify(staticRoutes));
      }
    },
    name: "@hono/vite-build/cloudflare-pages"
  };
};
var cloudflare_pages_default = cloudflarePagesBuildPlugin;
export {
  cloudflare_pages_default as default
};
