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
export function loggerMiddleware(ctx, next) {
    const startTime = Date.now(); // renamed for clarity
    return next().then(() => {
        const elapsed = Date.now() - startTime;
        const statusCode = ctx.res.statusCode;
        const httpMethod = ctx.method;
        const requestUrl = ctx.url;
        console.log(`[${httpMethod}] ${requestUrl} - ${statusCode} in ${elapsed}ms`);
    }).catch((err) => {
        // Log error case as well - helps with debugging
        const elapsed = Date.now() - startTime;
        const statusCode = ctx.res.statusCode || 500;
        const httpMethod = ctx.method;
        const requestUrl = ctx.url;
        console.log(`[${httpMethod}] ${requestUrl} - ${statusCode} in ${elapsed}ms`);
        // Re-throw the error so it can be handled by error handlers
        throw err;
    });
}
export function createLoggerMiddleware(opts = {}) {
    const { format, includeTimestamp = false, colors = false, silent = false } = opts;
    // Color codes for terminal output - basic ANSI stuff
    const terminalColors = {
        reset: '\x1b[0m',
        bright: '\x1b[1m',
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        cyan: '\x1b[36m',
        white: '\x1b[37m',
        gray: '\x1b[90m'
    };
    function addColor(text, color) {
        if (!colors)
            return text;
        return `${terminalColors[color]}${text}${terminalColors.reset}`;
    }
    // Quick helper to pick status colors
    function getStatusColor(statusCode) {
        if (statusCode >= 200 && statusCode < 300)
            return 'green';
        if (statusCode >= 300 && statusCode < 400)
            return 'cyan';
        if (statusCode >= 400 && statusCode < 500)
            return 'yellow';
        return 'red';
    }
    // Quick helper to pick method colors - because why not make it pretty
    function getMethodColor(httpMethod) {
        switch (httpMethod.toUpperCase()) {
            case 'GET': return 'green';
            case 'POST': return 'blue';
            case 'PUT': return 'yellow';
            case 'DELETE': return 'red';
            case 'PATCH': return 'magenta';
            default: return 'white';
        }
    }
    return async (ctx, next) => {
        if (silent) {
            return next(); // Skip logging entirely
        }
        const startTime = Date.now();
        try {
            await next();
            const elapsed = Date.now() - startTime;
            const statusCode = ctx.res.statusCode;
            const httpMethod = ctx.method;
            const requestUrl = ctx.url;
            let logOutput;
            if (format) {
                // User provided their own format function
                logOutput = format(httpMethod, requestUrl, statusCode, elapsed);
            }
            else {
                const timePrefix = includeTimestamp ? `${new Date().toISOString()} ` : '';
                if (colors) {
                    // Fancy colored output
                    const coloredMethod = addColor(`[${httpMethod}]`, getMethodColor(httpMethod));
                    const coloredStatus = addColor(statusCode.toString(), getStatusColor(statusCode));
                    const coloredDuration = addColor(`${elapsed}ms`, 'gray');
                    logOutput = `${timePrefix}${coloredMethod} ${requestUrl} - ${coloredStatus} in ${coloredDuration}`;
                }
                else {
                    // Plain text output
                    logOutput = `${timePrefix}[${httpMethod}] ${requestUrl} - ${statusCode} in ${elapsed}ms`;
                }
            }
            console.log(logOutput);
        }
        catch (err) {
            // Log error case - still want to track what happened
            const elapsed = Date.now() - startTime;
            const statusCode = ctx.res.statusCode || 500;
            const httpMethod = ctx.method;
            const requestUrl = ctx.url;
            let logOutput;
            if (format) {
                logOutput = format(httpMethod, requestUrl, statusCode, elapsed);
            }
            else {
                const timePrefix = includeTimestamp ? `${new Date().toISOString()} ` : '';
                if (colors) {
                    const coloredMethod = addColor(`[${httpMethod}]`, getMethodColor(httpMethod));
                    const coloredStatus = addColor(statusCode.toString(), getStatusColor(statusCode));
                    const coloredDuration = addColor(`${elapsed}ms`, 'gray');
                    logOutput = `${timePrefix}${coloredMethod} ${requestUrl} - ${coloredStatus} in ${coloredDuration}`;
                }
                else {
                    logOutput = `${timePrefix}[${httpMethod}] ${requestUrl} - ${statusCode} in ${elapsed}ms`;
                }
            }
            console.log(logOutput);
            throw err; // Re-throw so error handlers can deal with it
        }
    };
}
// Export both for convenience - some people like default imports
export default loggerMiddleware;
//# sourceMappingURL=logger.js.map