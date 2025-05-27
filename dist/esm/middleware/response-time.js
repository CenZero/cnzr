/**
 * Default response time options - reasonable defaults
 */
const defaultConfig = {
    header: "X-Response-Time",
    formatter: (time) => `${time}ms`,
    log: false,
    precision: 0,
    hrtime: true,
};
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
export function responseTimeMiddleware(ctx, next) {
    return createResponseTimeMiddleware()(ctx, next);
}
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
export function createResponseTimeMiddleware(options = {}) {
    const config = { ...defaultConfig, ...options };
    return function responseTimeHandler(ctx, next) {
        let startMark;
        // Record start time - hrtime is more precise but overkill for most cases
        if (config.hrtime) {
            startMark = process.hrtime();
        }
        else {
            startMark = Date.now();
        }
        return next().then(() => {
            // Calculate how long it took
            let elapsedMs;
            if (config.hrtime && Array.isArray(startMark)) {
                const diff = process.hrtime(startMark);
                elapsedMs = diff[0] * 1000 + diff[1] * 1e-6; // Convert to milliseconds
            }
            else {
                elapsedMs = Date.now() - startMark;
            }
            // Apply precision if needed
            if (config.precision > 0) {
                elapsedMs = Number(elapsedMs.toFixed(config.precision));
            }
            else {
                elapsedMs = Math.round(elapsedMs);
            }
            // Format the time string
            const timeStr = config.formatter(elapsedMs);
            // Set the response header
            ctx.set(config.header, timeStr);
            // Log if enabled - useful for development
            if (config.log) {
                console.log(`${ctx.method} ${ctx.url} - Response time: ${timeStr}`);
            }
        }).catch((err) => {
            // Still calculate and set response time even if there's an error
            let elapsedMs;
            if (config.hrtime && Array.isArray(startMark)) {
                const diff = process.hrtime(startMark);
                elapsedMs = diff[0] * 1000 + diff[1] * 1e-6;
            }
            else {
                elapsedMs = Date.now() - startMark;
            }
            if (config.precision > 0) {
                elapsedMs = Number(elapsedMs.toFixed(config.precision));
            }
            else {
                elapsedMs = Math.round(elapsedMs);
            }
            const timeStr = config.formatter(elapsedMs);
            ctx.set(config.header, timeStr);
            if (config.log) {
                console.log(`${ctx.method} ${ctx.url} - Response time: ${timeStr} (ERROR)`);
            }
            // Re-throw the error so other handlers can deal with it
            throw err;
        });
    };
}
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
export function preciseResponseTime(ctx, next) {
    return createResponseTimeMiddleware({
        precision: 2,
        hrtime: true
    })(ctx, next);
}
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
export function responseTimeWithLogging(ctx, next) {
    return createResponseTimeMiddleware({
        log: true,
        precision: 1
    })(ctx, next);
}
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
export function createCustomResponseTime(headerName) {
    return createResponseTimeMiddleware({
        header: headerName
    });
}
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
export function createFormattedResponseTime(formatter) {
    return createResponseTimeMiddleware({
        formatter
    });
}
//# sourceMappingURL=response-time.js.map