"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compressionPlugin = exports.authPlugin = exports.requestIdPlugin = void 0;
const requestIdPlugin = (app, options = {}) => {
    const opts = {
        header: 'X-Request-ID',
        generator: () => Math.random().toString(36).substring(2, 15),
        ...options
    };
    console.log(`🔌 RequestID Plugin loaded with header: ${opts.header}`);
    // Register hooks using the Plugin system
    app.getPluginManager().register({
        name: 'request-id',
        version: '1.0.0',
        dependencies: [],
        hooks: {
            // New req/res-based hook
            onRequest: async (req, res) => {
                const requestId = opts.generator();
                res.setHeader(opts.header, requestId);
                // Add to request for other middlewares to use
                req.requestId = requestId;
            }
        },
        install: async () => {
            // Plugin installation logic if needed
        }
    });
};
exports.requestIdPlugin = requestIdPlugin;
const authPlugin = (app, options = {}) => {
    const opts = {
        secret: 'default-secret',
        paths: ['/protected'],
        ...options
    };
    console.log(`🔌 Auth Plugin loaded for paths: ${opts.paths.join(', ')}`);
    app.getPluginManager().register({
        name: 'auth',
        version: '1.0.0',
        dependencies: [],
        hooks: {
            onRequest: async (req, res) => {
                const url = require('url').parse(req.url || '');
                const isProtectedPath = opts.paths.some(path => url.pathname?.startsWith(path));
                if (isProtectedPath) {
                    const authHeader = req.headers.authorization;
                    if (!authHeader || !authHeader.startsWith('Bearer ')) {
                        res.statusCode = 401;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ error: 'Unauthorized', message: 'Missing or invalid token' }));
                        return;
                    }
                    // Simple token validation (in real app, use proper JWT validation)
                    const token = authHeader.substring(7);
                    if (token !== opts.secret) {
                        res.statusCode = 403;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ error: 'Forbidden', message: 'Invalid token' }));
                        return;
                    }
                    // Add user info to request
                    req.user = { id: 1, username: 'testuser' };
                }
            }
        },
        install: async () => {
            // Plugin installation logic
        }
    });
};
exports.authPlugin = authPlugin;
const compressionPlugin = (app, options = {}) => {
    const opts = {
        threshold: 1024, // Only compress responses larger than 1KB
        algorithms: ['gzip', 'deflate'],
        ...options
    };
    console.log(`🔌 Compression Plugin loaded with threshold: ${opts.threshold} bytes`);
    app.getPluginManager().register({
        name: 'compression',
        version: '1.0.0',
        dependencies: [],
        hooks: {
            onResponse: async (req, res) => {
                const acceptEncoding = req.headers['accept-encoding'] || '';
                if (acceptEncoding.includes('gzip') && opts.algorithms.includes('gzip')) {
                    res.setHeader('Content-Encoding', 'gzip');
                    res.setHeader('Vary', 'Accept-Encoding');
                }
                else if (acceptEncoding.includes('deflate') && opts.algorithms.includes('deflate')) {
                    res.setHeader('Content-Encoding', 'deflate');
                    res.setHeader('Vary', 'Accept-Encoding');
                }
            }
        },
        install: async () => {
            // Plugin installation logic
        }
    });
};
exports.compressionPlugin = compressionPlugin;
//# sourceMappingURL=example-plugins.js.map