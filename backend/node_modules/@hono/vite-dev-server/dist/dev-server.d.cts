import { Plugin } from 'vite';
import { Env, EnvFunc, LoadModule, Adapter } from './types.cjs';

type DevServerOptions = {
    entry?: string;
    export?: string;
    injectClientScript?: boolean;
    exclude?: (string | RegExp)[];
    ignoreWatching?: (string | RegExp)[];
    env?: Env | EnvFunc;
    loadModule?: LoadModule;
    /**
     * This can be used to inject environment variables into the worker from your wrangler.toml for example,
     * by making use of the helper function `getPlatformProxy` from `wrangler`.
     *
     * @example
     *
     * ```ts
     * import { defineConfig } from 'vite'
     * import devServer from '@hono/vite-dev-server'
     * import getPlatformProxy from 'wrangler'
     *
     * export default defineConfig(async () => {
     *    const { env, dispose } = await getPlatformProxy()
     *    return {
     *      plugins: [
     *        devServer({
     *          adapter: {
     *            env,
     *            onServerClose: dispose
     *          },
     *        }),
     *      ],
     *    }
     *  })
     * ```
     *
     *
     */
    adapter?: Adapter | Promise<Adapter> | (() => Adapter | Promise<Adapter>);
};
declare const defaultOptions: Required<Omit<DevServerOptions, 'env' | 'adapter' | 'loadModule'>>;
declare function devServer(options?: DevServerOptions): Plugin;

export { DevServerOptions, defaultOptions, devServer };
