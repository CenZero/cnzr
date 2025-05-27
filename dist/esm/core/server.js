import { createServer } from "http";
import { Router } from './router.js';
import { RequestParser } from "./request-parser.js";
import { ResponseHelper } from './response-helper.js';
import { StaticFileServer } from "./static-file-server.js";
import { TemplateEngine } from './template-engine.js';
import { Context } from "./context.js";
import { PluginManager } from './plugin.js';
import { FileRouter } from "./file-router.js";
import { ErrorHandlerManager } from './error-handler.js';
import { MiddlewareEngine } from './middleware-engine.js';
// TODO: Maybe add some performance monitoring later?
// NOTE: Had to import everything manually - TypeScript auto-import was being weird
// My personal ASCII banner - yeah, I'm that kind of dev 😎
const CENZERO_BANNER = `
  ___  ____  __ _  ____  ____  ____   __  
 / __)(  __)(  ( \(__  )(  __)(  _ \ /  \ 
( (__  ) _) /    / / _/  ) _)  )   /(  O )
 \___)(____)\_)__)(____)(____)(__\_) \__/ 
             Cenzero Framework  
    "Fast, flexible, and surprisingly fun" 🚀
`;
// Helper utilities - gw bikin sendiri instead of importing lodash buat everything
const ServerUtils = {
    // Quick random quotes for startup - because why not? 
    getRandomQuote: () => {
        const quotes = [
            "Building something awesome...",
            "Let's ship this thing! 🚢",
            "Coffee-powered development mode activated ☕",
            "Another day, another framework 😅",
            "Making the web a better place, one route at a time",
            "Siap-siap begadang mode on! 🌙",
            "Code dengan hati, debug dengan sabar ❤️",
            "Production ready? We'll see... 🤞"
        ];
        return quotes[Math.floor(Math.random() * quotes.length)];
    },
    // Custom deep merge - gw ga trust libraries dengan objects gw
    deepMerge: (target, source) => {
        const result = { ...target };
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = ServerUtils.deepMerge(result[key] || {}, source[key]);
            }
            else {
                result[key] = source[key];
            }
        }
        return result;
    },
    // Personal logger with timestamp dan emoji
    devLog: (message, emoji = "🔧") => {
        if (process.env.NODE_ENV === 'development') {
            const timestamp = new Date().toLocaleTimeString();
            console.log(`${emoji} [${timestamp}] ${message}`);
        }
    },
    // Get server startup time - buat monitoring
    getStartupTime: (() => {
        const startTime = Date.now();
        return () => Date.now() - startTime;
    })(),
    // Random development tips - personal touch
    getDevTip: () => {
        const tips = [
            "💡 Pro tip: Check your console for helpful debug info",
            "🚀 Remember: Fast code is good, readable code is better",
            "⚡ Hot reload is your friend during development",
            "🔍 Use the debugger, console.log isn't always the answer",
            "📝 Comment your weird code, future you will thank you"
        ];
        return tips[Math.floor(Math.random() * tips.length)];
    }
};
export class CenzeroApp {
    constructor(options = {}) {
        this.myMiddlewareStack = []; // better name
        this.debugMode = false; // Quick debug toggle gw tambahin
        this.myRequestCount = 0; // Personal request counter buat statistics
        // Set up defaults - could probably make this cleaner but it works
        this.myAppConfig = {
            port: 3000,
            host: "localhost",
            staticDir: "public",
            viewEngine: "ejs",
            viewsDir: "views",
            useContext: true, // Default to context mode
            useFileRouting: false,
            routesDir: "routes",
            ...options // Spread operator buat override defaults
        };
        // Initialize core components - personal order yang gw suka
        this.myMainRouter = new Router();
        this.myMwEngine = new MiddlewareEngine();
        this.myStaticHandler = new StaticFileServer(this.myAppConfig.staticDir);
        this.myViewEngine = new TemplateEngine(this.myAppConfig.viewEngine, this.myAppConfig.viewsDir);
        this.myHttpServer = createServer(this.handleRequest.bind(this));
        this.myPluginMgr = new PluginManager(this);
        this.myErrHandler = new ErrorHandlerManager(this.myAppConfig.useContext);
        // Check if we should enable debug mode from env - personal debugging preference
        this.debugMode = process.env.CENZERO_DEBUG === 'true' || this.myAppConfig.debug === true;
        // Initialize file-based routing if enabled - optional feature gw tambahin  
        if (this.myAppConfig.useFileRouting) {
            this.myFileBasedRouter = new FileRouter(this, this.myAppConfig.routesDir);
        }
        // Personal startup message dengan flair
        if (this.debugMode) {
            ServerUtils.devLog("CenzeroApp instance created dengan love ❤️", "🚀");
            ServerUtils.devLog(ServerUtils.getDevTip(), "💡");
        }
    }
    // HTTP Methods - shorthand yang biasa dipake sehari-hari  
    get(path, ...handlers) {
        this.myMainRouter.get(path, ...handlers);
        if (this.debugMode) {
            ServerUtils.devLog(`GET route registered: ${path}`, "📝");
        }
    }
    post(path, ...handlers) {
        this.myMainRouter.post(path, ...handlers);
        if (this.debugMode) {
            ServerUtils.devLog(`POST route registered: ${path}`, "📝");
        }
    }
    put(path, ...handlers) {
        this.myMainRouter.put(path, ...handlers);
        if (this.debugMode) {
            ServerUtils.devLog(`PUT route registered: ${path}`, "📝");
        }
    }
    delete(path, ...handlers) {
        this.myMainRouter.delete(path, ...handlers);
        if (this.debugMode) {
            ServerUtils.devLog(`DELETE route registered: ${path}`, "📝");
        }
    }
    // Middleware stuff - ini agak tricky karena harus support legacy + new pattern
    // NOTE: sempet kepikiran mau bikin breaking change, tapi nanti user pada ngomel
    use(pathOrHandler, handler) {
        if (typeof pathOrHandler === 'function') {
            this.myMiddlewareStack.push(pathOrHandler);
            // Check if context middleware - kadang gw lupa ini step
            if (this.isContextMiddleware(pathOrHandler)) {
                this.myMwEngine.use(pathOrHandler);
            }
            if (this.debugMode) {
                ServerUtils.devLog(`Global middleware registered`, "🔗");
            }
        }
        else if (typeof pathOrHandler === "string" && handler) {
            this.myMainRouter.use(pathOrHandler, handler);
            // Same check for path-specific middleware
            if (this.isContextMiddleware(handler)) {
                this.myMwEngine.use(pathOrHandler, handler);
            }
            if (this.debugMode) {
                ServerUtils.devLog(`Path middleware registered: ${pathOrHandler}`, "🔗");
            }
        }
    }
    // Error handling - straightforward tapi penting
    onError(handler) {
        this.myErrHandler.register(handler);
        if (this.debugMode) {
            ServerUtils.devLog("Custom error handler registered", "⚠️");
        }
    }
    // Alias untuk setErrorHandler sesuai requirement 
    setErrorHandler(handler) {
        this.myErrHandler.register(handler);
        if (this.debugMode) {
            ServerUtils.devLog("Error handler set via setErrorHandler", "⚠️");
        }
    }
    // Get file routes info (for debugging)
    getFileRoutes() {
        return this.myFileBasedRouter ? this.myFileBasedRouter.getRoutes() : [];
    }
    // Enable file-based routing dynamically
    async enableFileRouting(routesDir = 'routes') {
        this.myFileBasedRouter = new FileRouter(this, routesDir);
        await this.myFileBasedRouter.scanAndRegister();
        if (this.debugMode) {
            ServerUtils.devLog(`File routing enabled for: ${routesDir}`, "📁");
        }
    }
    // Plugin system - enhanced dengan logging  
    async plugin(plugin, options) {
        await this.myPluginMgr.register(plugin, options);
        if (this.debugMode) {
            ServerUtils.devLog("Plugin registered via .plugin()", "🔌");
        }
    }
    // Enhanced plugin system - use plugin functions
    async usePlugin(pluginFn, config) {
        await this.myPluginMgr.usePlugin(pluginFn, config);
        if (this.debugMode) {
            ServerUtils.devLog("Plugin registered via .usePlugin()", "🔌");
        }
    }
    // Static files - simple tapi berguna
    static(path, directory) {
        this.myStaticHandler.addStaticPath(path, directory);
        if (this.debugMode) {
            ServerUtils.devLog(`Static path mapped: ${path} -> ${directory}`, "📁");
        }
    }
    // Template engine - untuk rendering views
    render(template, data = {}) {
        return this.myViewEngine.render(template, data);
    }
    // Session configuration method - enhanced dengan logging
    useSession(options = {}) {
        this.mySessionConfig = {
            name: options.name || 'cenzero-session',
            secret: options.secret || 'cenzero-default-secret',
            maxAge: options.maxAge || 24 * 60 * 60 * 1000, // 24 hours
            secure: options.secure || false,
            httpOnly: options.httpOnly !== false,
            sameSite: options.sameSite || 'lax'
        };
        if (this.debugMode) {
            ServerUtils.devLog(`Session configured: ${this.mySessionConfig.name}`, "🍪");
        }
    }
    // Get session options (for context initialization)
    getSessionOptions() {
        return this.mySessionConfig;
    }
    // Public getters for testing - enhanced dengan personal naming
    getServer() {
        return this.myHttpServer;
    }
    getRouter() {
        return this.myMainRouter;
    }
    getPluginManager() {
        return this.myPluginMgr;
    }
    getMiddleware() {
        return this.myMiddlewareStack;
    }
    getErrorHandler() {
        return this.myErrHandler;
    }
    getMiddlewareEngine() {
        return this.myMwEngine;
    }
    // Bonus method - get server statistics (personal addition)
    getServerStats() {
        return {
            requestCount: this.myRequestCount,
            uptime: ServerUtils.getStartupTime(),
            memoryUsage: process.memoryUsage(),
            routes: this.myMainRouter.getRoutes?.length || 0,
            middleware: this.myMiddlewareStack.length
        };
    }
    // Start server - ini bagian yang paling gw suka 🎉
    listen(port, host, callback) {
        const actualPort = port || this.myAppConfig.port;
        const actualHost = host || this.myAppConfig.host;
        return this.myHttpServer.listen(actualPort, actualHost, async () => {
            // File routing setup - kalo di-enable
            if (this.myFileBasedRouter) {
                await this.myFileBasedRouter.scanAndRegister();
            }
            // Plugin hooks - jalanin semua yang perlu dijalanin saat startup
            await this.myPluginMgr.executeStartHook(this.myHttpServer);
            await this.myPluginMgr.onStart(); // legacy support
            // Quick debug toggle I added - helpful for development  
            if (this.debugMode) {
                console.log(CENZERO_BANNER);
                console.log(`🎯 ${ServerUtils.getRandomQuote()}`);
                console.log('');
                console.log('📊 Server Info:');
                console.log(`   └─ Address: http://${actualHost}:${actualPort}`);
                console.log(`   └─ PID: ${process.pid}`);
                console.log(`   └─ Node: ${process.version}`);
                console.log(`   └─ ENV: ${process.env.NODE_ENV || 'development'}`);
                console.log(`   └─ Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
                console.log('');
                console.log('🔧 Features:');
                console.log(`   └─ Context Mode: ${this.myAppConfig.useContext ? '✅' : '❌'}`);
                console.log(`   └─ File Routing: ${this.myAppConfig.useFileRouting ? '✅' : '❌'}`);
                console.log(`   └─ Static Files: ${this.myStaticHandler ? '✅' : '❌'}`);
                console.log(`   └─ View Engine: ${this.myViewEngine ? '✅' : '❌'}`);
                console.log('');
                console.log('🚀 Ready! Hit Ctrl+C to stop');
                console.log('━'.repeat(60));
            }
            else {
                // Simple non-debug output - clean and minimal
                console.log(`🚀 Cenzero server running on http://${actualHost}:${actualPort}`);
            }
            // Show startup info - bit of fun here (updated version)
            if (this.debugMode) {
                console.log(`
   ╔═══════════════════════════════════════╗
   ║                                       ║
   ║        🚀 Cenzero Framework 🚀       ║  
   ║                                       ║
   ╚═══════════════════════════════════════╝
        `);
                console.log(`📍 Server details:`);
                console.log(`   • URL: http://${actualHost}:${actualPort}`);
                console.log(`   • Environment: ${process.env.NODE_ENV || 'development'}`);
                console.log(`   • PID: ${process.pid}`);
                console.log(`   • File routing: ${this.myAppConfig.useFileRouting ? '✅' : '❌'}`);
                console.log(`   • Debug mode: ${this.debugMode ? '✅' : '❌'}`);
                console.log('');
            }
            if (callback)
                callback();
        });
    }
    // Main request handler - enhanced dengan request counting
    async handleRequest(req, res) {
        const cenzeroReq = req;
        const cenzeroRes = ResponseHelper.enhance(res);
        let ctx = null;
        // Increment request counter - personal statistics tracking
        this.myRequestCount++;
        try {
            // Parse request
            await RequestParser.parseRequest(cenzeroReq);
            // Create context if using context mode
            ctx = this.myAppConfig.useContext ? new Context(cenzeroReq, cenzeroRes, this.mySessionConfig) : null;
            // Execute new req/res-based plugin hooks 
            await this.myPluginMgr.executeRequestHook(req, res);
            // Execute legacy context-based plugin hooks for backward compatibility
            if (ctx) {
                await this.myPluginMgr.onRequest(ctx);
            }
            // Check for static files first (quick win)
            if (await this.myStaticHandler.handleStatic(cenzeroReq, cenzeroRes)) {
                return;
            }
            // Execute global middlewares
            if (ctx) {
                await this.executeContextMiddlewares(this.myMiddlewareStack, ctx);
            }
            else {
                await this.executeLegacyMiddlewares(this.myMiddlewareStack, cenzeroReq, cenzeroRes);
            }
            // Find matching route
            const match = this.myMainRouter.matchRoute(cenzeroReq.method, cenzeroReq.path);
            if (match) {
                cenzeroReq.params = match.params;
                if (ctx) {
                    ctx.params = match.params;
                    await this.myPluginMgr.onRoute(ctx);
                }
                // Execute route-specific middlewares
                if (ctx) {
                    await this.executeContextMiddlewares(match.route.middlewares, ctx);
                }
                else {
                    await this.executeLegacyMiddlewares(match.route.middlewares, cenzeroReq, cenzeroRes);
                }
                // Execute route handler
                if (ctx && this.isContextHandler(match.route.handler)) {
                    await match.route.handler(ctx);
                }
                else {
                    await match.route.handler(cenzeroReq, cenzeroRes);
                }
                // Execute new req/res-based response hooks
                await this.myPluginMgr.executeResponseHook(req, res);
                // Execute legacy context-based response hooks for backward compatibility
                if (ctx) {
                    await this.myPluginMgr.onResponse(ctx);
                }
            }
            else {
                // 404 Not Found - handle gracefully
                this.handle404(cenzeroReq, cenzeroRes, ctx);
            }
        }
        catch (error) {
            // Execute new req/res-based error hooks
            await this.myPluginMgr.executeErrorHook(error, req, res);
            // Use the error handler manager
            await this.myErrHandler.handle(error, cenzeroReq, cenzeroRes, ctx || undefined);
        }
    }
    // Helper methods - detect handler/middleware type
    isContextHandler(handler) {
        return handler.length === 1; // Context handlers take 1 parameter
    }
    isContextMiddleware(middleware) {
        return middleware.length === 2; // Context middlewares take 2 parameters (ctx, next)
    }
    // Execute context middlewares
    async executeContextMiddlewares(middlewares, ctx) {
        for (let i = 0; i < middlewares.length; i++) {
            const middleware = middlewares[i];
            if (this.isContextMiddleware(middleware)) {
                await new Promise((resolve, reject) => {
                    const next = async () => resolve();
                    const result = middleware(ctx, next);
                    if (result instanceof Promise) {
                        result.catch(reject);
                    }
                });
            }
            else {
                // Legacy middleware
                await new Promise((resolve, reject) => {
                    let nextCalled = false;
                    const next = () => {
                        if (nextCalled)
                            return;
                        nextCalled = true;
                        resolve();
                    };
                    const result = middleware(ctx.req, ctx.res, next);
                    if (result instanceof Promise) {
                        result.catch(reject);
                    }
                    if (!nextCalled && !(result instanceof Promise)) {
                        setTimeout(() => {
                            if (!nextCalled)
                                resolve();
                        }, 0);
                    }
                });
            }
        }
    }
    // Execute legacy middlewares
    async executeLegacyMiddlewares(middlewares, req, res) {
        for (let i = 0; i < middlewares.length; i++) {
            await new Promise((resolve, reject) => {
                let nextCalled = false;
                const next = () => {
                    if (nextCalled)
                        return;
                    nextCalled = true;
                    resolve();
                };
                const result = middlewares[i](req, res, next);
                if (result instanceof Promise) {
                    result.catch(reject);
                }
                if (!nextCalled && !(result instanceof Promise)) {
                    setTimeout(() => {
                        if (!nextCalled)
                            resolve();
                    }, 0);
                }
            });
        }
    }
    // Error handlers
    handle404(req, res, ctx) {
        res.status(404).json({
            error: 'Not Found',
            message: `Cannot ${req.method} ${req.path}`,
            statusCode: 404
        });
    }
    async handle500(error, req, res, ctx) {
        // TODO: maybe add proper logging service here instead of console.error
        console.error('Internal Server Error:', error);
        if (ctx) {
            await this.myPluginMgr.onError(error, ctx);
        }
        if (!res.headersSent) {
            res.status(500).json({
                error: 'Internal Server Error',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
                statusCode: 500
            });
        }
    }
    // Graceful shutdown - enhanced dengan logging
    async close(callback) {
        if (this.debugMode) {
            ServerUtils.devLog("Shutting down server gracefully...", "🛑");
        }
        await this.myPluginMgr.onStop();
        this.myHttpServer.close(callback);
    }
}
//# sourceMappingURL=server.js.map