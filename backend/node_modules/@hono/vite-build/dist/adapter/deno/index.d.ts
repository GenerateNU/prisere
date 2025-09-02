import { Plugin } from 'vite';
import { BuildOptions } from '../../base.js';
import '../../entry/index.js';

type DenoBuildOptions = {
    staticRoot?: string | undefined;
} & BuildOptions;
declare const denoBuildPlugin: (pluginOptions?: DenoBuildOptions) => Plugin;

export { DenoBuildOptions, denoBuildPlugin as default };
