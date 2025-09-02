import { Adapter } from '../types.js';
import 'vite';

declare const nodeAdapter: () => Adapter;

export { nodeAdapter as default, nodeAdapter };
