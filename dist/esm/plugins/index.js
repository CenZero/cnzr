import { createPlugin } from "../core/plugin.js";
import { Logger } from "../core/logger.js";
import { CorsMiddleware } from "../core/cors.js";
// Logger Plugin Factory
export const loggerPlugin = (options = {}) => createPlugin({
    name: 'logger',
    version: '1.0.0',
    install(app) {
        const logger = new Logger(options);
        // Add logger middleware
        app.use(logger.middleware());
        // Add logger to app instance for global access
        app.logger = logger;
    },
    hooks: {
        onStart(app) {
            console.log('🔌 Logger plugin activated');
        }
    }
});
// CORS Plugin Factory
export const corsPlugin = (options = {}) => createPlugin({
    name: 'cors',
    version: '1.0.0',
    install(app) {
        const corsMiddleware = new CorsMiddleware(options);
        // Add CORS middleware as the first middleware
        app.use(corsMiddleware.middleware());
    },
    hooks: {
        onStart(app) {
            console.log('🔌 CORS plugin activated');
        }
    }
});
// Response Time Plugin Factory
export const responseTimePlugin = (options = {}) => createPlugin({
    name: 'response-time',
    version: '1.0.0',
    install(app) {
        const headerName = options.headerName || 'X-Response-Time';
        app.use(async (ctx, next) => {
            const start = Date.now();
            await next();
            const responseTime = Date.now() - start;
            ctx.set(headerName, `${responseTime}ms`);
        });
    },
    hooks: {
        onStart(app) {
            console.log('🔌 Response Time plugin activated');
        }
    }
});
// Security Headers Plugin Factory
export const securityPlugin = (options = {}) => createPlugin({
    name: 'security',
    version: '1.0.0',
    install(app) {
        const defaults = {
            contentSecurityPolicy: "default-src 'self'",
            xFrameOptions: 'DENY',
            xContentTypeOptions: 'nosniff',
            referrerPolicy: 'strict-origin-when-cross-origin',
            xssProtection: '1; mode=block',
            ...options
        };
        app.use(async (ctx, next) => {
            if (defaults.contentSecurityPolicy) {
                ctx.set('Content-Security-Policy', defaults.contentSecurityPolicy);
            }
            if (defaults.xFrameOptions) {
                ctx.set('X-Frame-Options', defaults.xFrameOptions);
            }
            if (defaults.xContentTypeOptions) {
                ctx.set('X-Content-Type-Options', defaults.xContentTypeOptions);
            }
            if (defaults.referrerPolicy) {
                ctx.set('Referrer-Policy', defaults.referrerPolicy);
            }
            if (defaults.xssProtection) {
                ctx.set('X-XSS-Protection', defaults.xssProtection);
            }
            await next();
        });
    },
    hooks: {
        onStart(app) {
            console.log('🔌 Security Headers plugin activated');
        }
    }
});
// Compression Plugin Factory (simple gzip)
export const compressionPlugin = (options = {}) => createPlugin({
    name: 'compression',
    version: '1.0.0',
    install(app) {
        const { gzip } = require('zlib');
        const { promisify } = require('util');
        const gzipAsync = promisify(gzip);
        const threshold = options.threshold || 1024;
        const level = options.level || 6;
        app.use(async (ctx, next) => {
            await next();
            const acceptEncoding = ctx.get('accept-encoding') || '';
            if (!acceptEncoding.includes('gzip'))
                return;
            const body = ctx.res.getHeader('content-length');
            if (body && parseInt(body) < threshold)
                return;
            // Intercept response
            const originalEnd = ctx.res.end;
            let body_data = '';
            ctx.res.end = function (chunk) {
                if (chunk)
                    body_data += chunk;
                return this;
            };
            // Compress and send
            if (body_data) {
                try {
                    const compressed = await gzipAsync(body_data, { level });
                    ctx.set('Content-Encoding', 'gzip');
                    ctx.set('Content-Length', compressed.length.toString());
                    originalEnd.call(ctx.res, compressed, 'utf8');
                }
                catch (error) {
                    originalEnd.call(ctx.res, body_data, 'utf8');
                }
            }
        });
    },
    hooks: {
        onStart(app) {
            console.log('🔌 Compression plugin activated');
        }
    }
});
// Request ID Plugin Factory
export const requestIdPlugin = (options = {}) => createPlugin({
    name: 'request-id',
    version: '1.0.0',
    install(app) {
        const { randomUUID } = require('crypto');
        const headerName = options.headerName || 'X-Request-ID';
        app.use(async (ctx, next) => {
            const requestId = ctx.get(headerName) || randomUUID();
            ctx.set(headerName, requestId);
            ctx.state.requestId = requestId;
            await next();
        });
    },
    hooks: {
        onStart(app) {
            console.log('🔌 Request ID plugin activated');
        }
    }
});
// Export aliases for backward compatibility and easier imports
export const logger = loggerPlugin;
export const cors = corsPlugin;
export const responseTime = responseTimePlugin;
export const security = securityPlugin;
export const compression = compressionPlugin;
export const requestId = requestIdPlugin;
// Export example plugin functions (renamed to avoid conflicts)
export { requestIdPlugin as requestIdPluginFunction, authPlugin as authPluginFunction, compressionPlugin as compressionPluginFunction } from './example-plugins.js';
//# sourceMappingURL=index.js.map