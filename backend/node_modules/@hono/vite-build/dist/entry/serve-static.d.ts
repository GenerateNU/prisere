type ServeStaticHookOptions = {
    filePaths?: string[];
    root?: string;
};
declare const serveStaticHook: (appName: string, options: ServeStaticHookOptions) => string;

export { serveStaticHook };
