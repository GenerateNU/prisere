import { Plugin } from 'vite';
import { BuildOptions } from '../../base.js';
import '../../entry/index.js';

type CloudflareWorkersBuildOptions = BuildOptions;
declare const cloudflareWorkersBuildPlugin: (pluginOptions?: CloudflareWorkersBuildOptions) => Plugin;

export { CloudflareWorkersBuildOptions, cloudflareWorkersBuildPlugin as default };
