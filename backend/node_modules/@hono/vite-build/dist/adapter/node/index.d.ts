import { Plugin } from 'vite';
import { BuildOptions } from '../../base.js';
import '../../entry/index.js';

type NodeBuildOptions = {
    staticRoot?: string | undefined;
    port?: number | undefined;
} & BuildOptions;
declare const nodeBuildPlugin: (pluginOptions?: NodeBuildOptions) => Plugin;

export { NodeBuildOptions, nodeBuildPlugin as default };
