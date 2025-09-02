import { Plugin } from 'vite';
import { BuildOptions } from '../../base.js';
import '../../entry/index.js';

type CloudflarePagesBuildOptions = BuildOptions;
declare const cloudflarePagesBuildPlugin: (pluginOptions?: CloudflarePagesBuildOptions) => Plugin;

export { CloudflarePagesBuildOptions, cloudflarePagesBuildPlugin as default };
