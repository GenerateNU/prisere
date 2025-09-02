import { Adapter } from '../types.js';
import 'vite';

declare const bunAdapter: () => Adapter;

export { bunAdapter, bunAdapter as default };
