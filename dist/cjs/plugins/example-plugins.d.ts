import { PluginFunction } from '../core/plugin';
export interface RequestIdOptions {
    header?: string;
    generator?: () => string;
}
export declare const requestIdPlugin: PluginFunction;
export interface AuthOptions {
    secret?: string;
    paths?: string[];
}
export declare const authPlugin: PluginFunction;
export interface CompressionOptions {
    threshold?: number;
    algorithms?: string[];
}
export declare const compressionPlugin: PluginFunction;
//# sourceMappingURL=example-plugins.d.ts.map