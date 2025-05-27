import { CenzeroContext } from "../core/context";
/**
 * Simple logger middleware for Cenzero Framework
 * Prints request logs in format: [METHOD] [URL] - [STATUS] in [ms]
 * Pretty basic but does the job
 *
 * Usage:
 * ```typescript
 * import { loggerMiddleware } from 'cenzero/middleware/logger';
 * app.use(loggerMiddleware);
 * ```
 */
export declare function loggerMiddleware(ctx: CenzeroContext, next: () => Promise<void>): Promise<void>;
/**
 * Customizable logger middleware factory
 * This one's got more bells and whistles if you need them
 *
 * @param options Configuration options for the logger
 * @returns Logger middleware function
 *
 * Usage:
 * ```typescript
 * import { createLoggerMiddleware } from 'cenzero/middleware/logger';
 *
 * // With custom options
 * const fancyLogger = createLoggerMiddleware({
 *   format: (method, url, status, duration) => `${method} ${url} -> ${status} (${duration}ms)`,
 *   includeTimestamp: true,
 *   colors: true
 * });
 * app.use(fancyLogger);
 * ```
 */
export interface LoggerOptions {
    /** Custom format function - roll your own if the default sucks */
    format?: (method: string, url: string, status: number, duration: number) => string;
    /** Include timestamp in logs */
    includeTimestamp?: boolean;
    /** Enable colored output - pretty but not always useful */
    colors?: boolean;
    /** Silent mode - disable logging completely */
    silent?: boolean;
}
export declare function createLoggerMiddleware(opts?: LoggerOptions): (ctx: CenzeroContext, next: () => Promise<void>) => Promise<void>;
export default loggerMiddleware;
//# sourceMappingURL=logger.d.ts.map