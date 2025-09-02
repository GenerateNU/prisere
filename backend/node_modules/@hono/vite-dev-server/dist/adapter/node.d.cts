import { Adapter } from '../types.cjs';
import 'vite';

declare const nodeAdapter: () => Adapter;

export { nodeAdapter as default, nodeAdapter };
