import { cors } from '../core/cors.js';
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
export function corsMiddleware(ctx, next) {
    return cors()(ctx, next);
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
export function createCorsMiddleware(options = {}) {
    return cors(options);
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
export function corsWithOrigins(allowedOrigins) {
    return cors({ origin: allowedOrigins });
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
export function corsWithCredentials(ctx, next) {
    return cors({ credentials: true })(ctx, next);
}
// Re-export types and core functionality for convenience
export { cors } from "../core/cors.js";
//# sourceMappingURL=cors.js.map