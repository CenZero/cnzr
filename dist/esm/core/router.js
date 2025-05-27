// Custom path matching - yeah I know Express does this, but I wanted to understand how it works
// Plus this gives us more control over edge cases
export class Router {
    constructor(prefix = '') {
        this.routeList = []; // keep track of all registered routes
        this.routePrefix = prefix;
        // TODO: maybe add some route validation later? not sure if needed
    }
    get(path, ...handlers) {
        this.addRoute("GET", path, handlers);
    }
    post(path, ...handlers) {
        this.addRoute("POST", path, handlers);
    }
    put(path, ...handlers) {
        this.addRoute("PUT", path, handlers);
    }
    delete(path, ...handlers) {
        this.addRoute("DELETE", path, handlers);
    }
    // NOTE: This one's a bit tricky - supports both global and path-specific middleware
    // Honestly took me a while to get this right, especially the path matching
    use(pathOrHandler, handler) {
        if (typeof pathOrHandler === 'function') {
            // Global middleware - applies to everything
            this.addRoute("*", "*", [pathOrHandler]);
        }
        else if (typeof pathOrHandler === "string" && handler) {
            // Path-specific middleware - only for certain routes
            this.addRoute("*", pathOrHandler, [handler]);
        }
        // NOTE: kalo ga match kondisi manapun, ya diabaikan aja - defensive programming
    }
    addRoute(httpMethod, routePath, handlerStack) {
        const fullPath = this.routePrefix + routePath;
        const middlewareList = handlerStack.slice(0, -1);
        const finalHandler = handlerStack[handlerStack.length - 1];
        this.routeList.push({
            method: httpMethod,
            path: fullPath,
            handler: finalHandler,
            middlewares: middlewareList,
            useContext: this.isContextHandler(finalHandler) || middlewareList.some(m => this.isContextMiddleware(m))
        });
    }
    // Helper to check if handler expects context object (newer style)
    isContextHandler(handlerFn) {
        return handlerFn.length === 1; // Context handlers take 1 parameter
    }
    // Check if middleware uses context pattern
    isContextMiddleware(middlewareFn) {
        return middlewareFn.length === 2; // Context middlewares take 2 parameters (ctx, next)
    }
    getRoutes() {
        return this.routeList;
    }
    // TODO: Maybe add some caching here for performance if we get lots of routes
    matchRoute(httpMethod, requestPath) {
        for (const registeredRoute of this.routeList) {
            if (registeredRoute.method !== "*" && registeredRoute.method !== httpMethod) {
                continue;
            }
            if (registeredRoute.path === "*") {
                return { route: registeredRoute, params: {} };
            }
            const extractedParams = this.matchPath(registeredRoute.path, requestPath);
            if (extractedParams !== null) {
                return { route: registeredRoute, params: extractedParams };
            }
        }
        return null; // no matching route found
    }
    // Path matching logic - handles dynamic params like :id
    matchPath(routePattern, actualPath) {
        const routeParts = routePattern.split("/").filter(s => s);
        const pathParts = actualPath.split("/").filter(s => s);
        if (routeParts.length !== pathParts.length) {
            return null; // different number of segments = no match
        }
        const extractedParams = {};
        for (let i = 0; i < routeParts.length; i++) {
            const routeSegment = routeParts[i];
            const pathSegment = pathParts[i];
            if (routeSegment.startsWith(":")) {
                // Dynamic parameter like :id or :userId
                const paramName = routeSegment.slice(1);
                extractedParams[paramName] = decodeURIComponent(pathSegment);
            }
            else if (routeSegment !== pathSegment) {
                return null; // literal segments must match exactly
            }
        }
        return extractedParams;
    }
}
//# sourceMappingURL=router.js.map