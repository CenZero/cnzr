import { LoggerOptions } from "../core/logger";
interface CorsOptions {
    origin?: string | string[] | boolean;
    methods?: string[];
    allowedHeaders?: string[];
    credentials?: boolean;
    [key: string]: any;
}
interface ResponseTimeOptions {
    headerName?: string;
    [key: string]: any;
}
interface CompressionOptions {
    threshold?: number;
    compressionLevel?: number;
    [key: string]: any;
}
interface RequestIdOptions {
    headerName?: string;
    [key: string]: any;
}
export declare const loggerPlugin: (options?: LoggerOptions) => import("../core/plugin").Plugin;
export declare const corsPlugin: (options?: CorsOptions) => import("../core/plugin").Plugin;
export declare const responseTimePlugin: (options?: ResponseTimeOptions) => import("../core/plugin").Plugin;
interface SecurityOptions {
    contentSecurityPolicy?: string;
    xFrameOptions?: string;
    xContentTypeOptions?: string;
    referrerPolicy?: string;
    xssProtection?: string;
    [key: string]: any;
}
export declare const securityPlugin: (options?: SecurityOptions) => import("../core/plugin").Plugin;
export declare const compressionPlugin: (options?: CompressionOptions) => import("../core/plugin").Plugin;
export declare const requestIdPlugin: (options?: RequestIdOptions) => import("../core/plugin").Plugin;
export declare const logger: (options?: LoggerOptions) => import("../core/plugin").Plugin;
export declare const cors: (options?: CorsOptions) => import("../core/plugin").Plugin;
export declare const responseTime: (options?: ResponseTimeOptions) => import("../core/plugin").Plugin;
export declare const security: (options?: SecurityOptions) => import("../core/plugin").Plugin;
export declare const compression: (options?: CompressionOptions) => import("../core/plugin").Plugin;
export declare const requestId: (options?: RequestIdOptions) => import("../core/plugin").Plugin;
export { requestIdPlugin as requestIdPluginFunction, authPlugin as authPluginFunction, compressionPlugin as compressionPluginFunction } from './example-plugins';
//# sourceMappingURL=index.d.ts.map