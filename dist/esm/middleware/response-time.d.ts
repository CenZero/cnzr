import { CenzeroContext } from "../core/context";
/**
 * Response time middleware options interface
 */
export interface ResponseTimeOptions {
    /**
     * The header name to use for response time
     * @default 'X-Response-Time'
     */
    header?: string;
    /**
     * Custom format function for the response time value
     * @default (time) => `${time}ms`
     */
    formatter?: (time: number) => string;
    /**
     * Whether to include response time in console logs - useful for debugging
     * @default false
     */
    log?: boolean;
    /**
     * Precision for timing measurements (decimal places)
     * @default 0
     */
    precision?: number;
    /**
     * Whether to use high-resolution time (process.hrtime) - more accurate but slightly more overhead
     * @default true
     */
    hrtime?: boolean;
}
/**
 * Simple response time middleware
 * Adds X-Response-Time header in format: X-Response-Time: 12ms
 * NOTE: Put this first in your middleware stack for accurate timing
 *
 * Usage:
 * ```typescript
 * import { responseTimeMiddleware } from 'cenzero/middleware/response-time';
 * app.use(responseTimeMiddleware); // Must be first in pipeline
 * ```
 */
export declare function responseTimeMiddleware(ctx: CenzeroContext, next: () => Promise<void>): Promise<void>;
/**
 * Creates a response time middleware with custom options
 * The fancy version with more control
 *
 * Usage:
 * ```typescript
 * import { createResponseTimeMiddleware } from 'cenzero/middleware/response-time';
 *
 * app.use(createResponseTimeMiddleware({
 *   header: 'X-Response-Time',
 *   precision: 2,
 *   log: true
 * }));
 * ```
 */
export declare function createResponseTimeMiddleware(options?: ResponseTimeOptions): (ctx: CenzeroContext, next: () => Promise<void>) => Promise<void>;
/**
 * Response time middleware with high precision timing
 * For when you really need to know those microseconds
 *
 * Usage:
 * ```typescript
 * import { preciseResponseTime } from 'cenzero/middleware/response-time';
 * app.use(preciseResponseTime);
 * ```
 */
export declare function preciseResponseTime(ctx: CenzeroContext, next: () => Promise<void>): Promise<void>;
/**
 * Response time middleware with console logging
 * Good for development when you want to see timing in console
 *
 * Usage:
 * ```typescript
 * import { responseTimeWithLogging } from 'cenzero/middleware/response-time';
 * app.use(responseTimeWithLogging);
 * ```
 */
export declare function responseTimeWithLogging(ctx: CenzeroContext, next: () => Promise<void>): Promise<void>;
/**
 * Response time middleware with custom header name
 * Because sometimes 'X-Response-Time' isn't what you want
 *
 * Usage:
 * ```typescript
 * import { createCustomResponseTime } from 'cenzero/middleware/response-time';
 * app.use(createCustomResponseTime('X-Processing-Time'));
 * ```
 */
export declare function createCustomResponseTime(headerName: string): (ctx: CenzeroContext, next: () => Promise<void>) => Promise<void>;
/**
 * Response time middleware with custom formatter
 * Roll your own time format
 *
 * Usage:
 * ```typescript
 * import { createFormattedResponseTime } from 'cenzero/middleware/response-time';
 *
 * app.use(createFormattedResponseTime((time) => `${time} milliseconds`));
 * ```
 */
export declare function createFormattedResponseTime(formatter: (time: number) => string): (ctx: CenzeroContext, next: () => Promise<void>) => Promise<void>;
//# sourceMappingURL=response-time.d.ts.map