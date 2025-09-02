import { Adapter } from '../types.cjs';
import 'vite';

declare const bunAdapter: () => Adapter;

export { bunAdapter, bunAdapter as default };
