import { ViteDevServer } from 'vite';

type Env = Record<string, unknown> | Promise<Record<string, unknown>>;
type EnvFunc = () => Env | Promise<Env>;
type GetEnv<Options> = (options: Options) => EnvFunc;
interface ExecutionContext {
    waitUntil(promise: Promise<unknown>): void;
    passThroughOnException(): void;
}
type Fetch = (request: Request, env: {}, executionContext: ExecutionContext) => Promise<Response>;
type LoadModule = (server: ViteDevServer, entry: string) => Promise<{
    fetch: Fetch;
}>;
interface Adapter {
    /**
     * Environment variables to be injected into the worker
     */
    env?: Env;
    /**
     * Function called when the vite dev server is closed
     */
    onServerClose?: () => Promise<void>;
    /**
     * Implementation of waitUntil and passThroughOnException
     */
    executionContext?: {
        waitUntil(promise: Promise<unknown>): void;
        passThroughOnException(): void;
    };
}

export { Adapter, Env, EnvFunc, ExecutionContext, Fetch, GetEnv, LoadModule };
