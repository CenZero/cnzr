"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cors = void 0;
exports.corsMiddleware = corsMiddleware;
exports.createCorsMiddleware = createCorsMiddleware;
exports.corsWithOrigins = corsWithOrigins;
exports.corsWithCredentials = corsWithCredentials;
const cors_1 = require("../core/cors");
/**
 * Simple CORS middleware with default settings
 * Allows all origins and common methods - pretty permissive but good for dev
 *
 * Usage:
 * ```typescript
 * import { corsMiddleware } from 'cenzero/middleware/cors';
 * app.use(corsMiddleware);
 * ```
 */
function corsMiddleware(ctx, next) {
    return (0, cors_1.cors)()(ctx, next);
}
/**
 * Creates a CORS middleware with custom options
 * NOTE: This is the one you probably want for production
 *
 * Usage:
 * ```typescript
 * import { createCorsMiddleware } from 'cenzero/middleware/cors';
 *
 * app.use(createCorsMiddleware({
 *   origin: ['http://localhost:3000', 'https://example.com'],
 *   methods: ['GET', 'POST'],
 *   credentials: true
 * }));
 * ```
 */
function createCorsMiddleware(options = {}) {
    return (0, cors_1.cors)(options);
}
/**
 * CORS middleware with specific origin whitelist
 * Quick helper when you just need to whitelist some origins
 *
 * Usage:
 * ```typescript
 * import { corsWithOrigins } from 'cenzero/middleware/cors';
 * app.use(corsWithOrigins(['http://localhost:3000', 'https://example.com']));
 * ```
 */
function corsWithOrigins(allowedOrigins) {
    return (0, cors_1.cors)({ origin: allowedOrigins });
}
/**
 * CORS middleware that allows credentials
 * Use this when you need cookies/auth headers to work cross-origin
 *
 * Usage:
 * ```typescript
 * import { corsWithCredentials } from 'cenzero/middleware/cors';
 * app.use(corsWithCredentials);
 * ```
 */
function corsWithCredentials(ctx, next) {
    return (0, cors_1.cors)({ credentials: true })(ctx, next);
}
// Re-export types and core functionality for convenience
var cors_2 = require("../core/cors");
Object.defineProperty(exports, "cors", { enumerable: true, get: function () { return cors_2.cors; } });
//# sourceMappingURL=cors.js.map