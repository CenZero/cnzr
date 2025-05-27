"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compressionPluginFunction = exports.authPluginFunction = exports.requestIdPluginFunction = exports.requestId = exports.compression = exports.security = exports.responseTime = exports.cors = exports.logger = exports.requestIdPlugin = exports.compressionPlugin = exports.securityPlugin = exports.responseTimePlugin = exports.corsPlugin = exports.loggerPlugin = void 0;
const plugin_1 = require("../core/plugin");
const logger_1 = require("../core/logger");
const cors_1 = require("../core/cors");
// Logger Plugin Factory
const loggerPlugin = (options = {}) => (0, plugin_1.createPlugin)({
    name: 'logger',
    version: '1.0.0',
    install(app) {
        const logger = new logger_1.Logger(options);
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
exports.loggerPlugin = loggerPlugin;
// CORS Plugin Factory
const corsPlugin = (options = {}) => (0, plugin_1.createPlugin)({
    name: 'cors',
    version: '1.0.0',
    install(app) {
        const corsMiddleware = new cors_1.CorsMiddleware(options);
        // Add CORS middleware as the first middleware
        app.use(corsMiddleware.middleware());
    },
    hooks: {
        onStart(app) {
            console.log('🔌 CORS plugin activated');
        }
    }
});
exports.corsPlugin = corsPlugin;
// Response Time Plugin Factory
const responseTimePlugin = (options = {}) => (0, plugin_1.createPlugin)({
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
exports.responseTimePlugin = responseTimePlugin;
// Security Headers Plugin Factory
const securityPlugin = (options = {}) => (0, plugin_1.createPlugin)({
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
exports.securityPlugin = securityPlugin;
// Compression Plugin Factory (simple gzip)
const compressionPlugin = (options = {}) => (0, plugin_1.createPlugin)({
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
exports.compressionPlugin = compressionPlugin;
// Request ID Plugin Factory
const requestIdPlugin = (options = {}) => (0, plugin_1.createPlugin)({
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
exports.requestIdPlugin = requestIdPlugin;
// Export aliases for backward compatibility and easier imports
exports.logger = exports.loggerPlugin;
exports.cors = exports.corsPlugin;
exports.responseTime = exports.responseTimePlugin;
exports.security = exports.securityPlugin;
exports.compression = exports.compressionPlugin;
exports.requestId = exports.requestIdPlugin;
// Export example plugin functions (renamed to avoid conflicts)
var example_plugins_1 = require("./example-plugins");
Object.defineProperty(exports, "requestIdPluginFunction", { enumerable: true, get: function () { return example_plugins_1.requestIdPlugin; } });
Object.defineProperty(exports, "authPluginFunction", { enumerable: true, get: function () { return example_plugins_1.authPlugin; } });
Object.defineProperty(exports, "compressionPluginFunction", { enumerable: true, get: function () { return example_plugins_1.compressionPlugin; } });
//# sourceMappingURL=index.js.map