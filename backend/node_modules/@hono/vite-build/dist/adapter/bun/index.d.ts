import { Plugin } from 'vite';
import { BuildOptions } from '../../base.js';
import '../../entry/index.js';

type BunBuildOptions = {
    staticRoot?: string | undefined;
} & BuildOptions;
declare const bunBuildPlugin: (pluginOptions?: BunBuildOptions) => Plugin;

export { BunBuildOptions, bunBuildPlugin as default };
