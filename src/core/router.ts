import { Route, RouteHandler, ContextRouteHandler, MiddlewareFunction, ContextMiddlewareFunction, CenzeroRequest, CenzeroResponse } from "./types";

// Custom path matching - yeah I know Express does this, but I wanted to understand how it works
// Plus this gives us more control over edge cases

export class Router {
  private routeList: Route[] = []; // keep track of all registered routes
  private routePrefix: string;
  private methodBuckets: Map<string, Route[]> = new Map();
  private wildcardRoutes: Route[] = [];

  constructor(prefix: string = '') {
    this.routePrefix = prefix;
    // TODO: maybe add some route validation later? not sure if needed
  }

  get(path: string, ...handlers: (RouteHandler | ContextRouteHandler | MiddlewareFunction | ContextMiddlewareFunction)[]): void {
    this.addRoute("GET", path, handlers);
  }

  post(path: string, ...handlers: (RouteHandler | ContextRouteHandler | MiddlewareFunction | ContextMiddlewareFunction)[]): void {
    this.addRoute("POST", path, handlers);
  }

  put(path: string, ...handlers: (RouteHandler | ContextRouteHandler | MiddlewareFunction | ContextMiddlewareFunction)[]): void {
    this.addRoute("PUT", path, handlers);
  }

  delete(path: string, ...handlers: (RouteHandler | ContextRouteHandler | MiddlewareFunction | ContextMiddlewareFunction)[]): void {
    this.addRoute("DELETE", path, handlers);
  }

  // NOTE: This one's a bit tricky - supports both global and path-specific middleware
  // Honestly took me a while to get this right, especially the path matching
  use(pathOrHandler: string | MiddlewareFunction | ContextMiddlewareFunction, handler?: MiddlewareFunction | ContextMiddlewareFunction): void {
    if (typeof pathOrHandler === 'function') {
      // Global middleware - applies to everything
      this.addRoute("*", "*", [pathOrHandler]);
    } else if (typeof pathOrHandler === "string" && handler) {
      // Path-specific middleware - only for certain routes
      this.addRoute("*", pathOrHandler, [handler]);
    }
    // NOTE: kalo ga match kondisi manapun, ya diabaikan aja - defensive programming
  }

  private addRoute(httpMethod: string, routePath: string, handlerStack: (RouteHandler | ContextRouteHandler | MiddlewareFunction | ContextMiddlewareFunction)[]): void {
    const fullPath = this.routePrefix + routePath;
    const middlewareList = handlerStack.slice(0, -1) as (MiddlewareFunction | ContextMiddlewareFunction)[];
    const finalHandler = handlerStack[handlerStack.length - 1] as (RouteHandler | ContextRouteHandler);

    const compiled = this.compilePath(fullPath);
    const route: Route = {
      method: httpMethod,
      path: fullPath,
      handler: finalHandler,
      middlewares: middlewareList,
      useContext: this.isContextHandler(finalHandler) || middlewareList.some(m => this.isContextMiddleware(m)),
      compiled
    };

    this.routeList.push(route);

    if (httpMethod === "*") {
      this.wildcardRoutes.push(route);
    } else {
      const bucket = this.methodBuckets.get(httpMethod) || [];
      bucket.push(route);
      this.methodBuckets.set(httpMethod, bucket);
    }
  }

  // Helper to check if handler expects context object (newer style)
  private isContextHandler(handlerFn: RouteHandler | ContextRouteHandler): boolean {
    return handlerFn.length === 1; // Context handlers take 1 parameter
  }

  // Check if middleware uses context pattern
  private isContextMiddleware(middlewareFn: MiddlewareFunction | ContextMiddlewareFunction): boolean {
    return middlewareFn.length === 2; // Context middlewares take 2 parameters (ctx, next)
  }

  getRoutes(): Route[] {
    return this.routeList;
  }

  matchRoute(httpMethod: string, requestPath: string): { route: Route; params: Record<string, string> } | null {
    const matchesMethod = (route: Route) =>
      route.method === "*" || route.method === httpMethod;

    const candidates: Route[] = [];
    const seen = new Set<Route>();

    const addCandidate = (route: Route) => {
      if (!seen.has(route)) {
        seen.add(route);
        candidates.push(route);
      }
    };

    (this.methodBuckets.get(httpMethod) || []).forEach(addCandidate);
    this.wildcardRoutes.forEach(addCandidate);

    for (const registeredRoute of candidates) {
      const extractedParams = this.matchPath(registeredRoute, requestPath);
      if (extractedParams !== null) {
        return { route: registeredRoute, params: extractedParams };
      }
    }

    // Fallback to full scan if not found (covers any edge cases)
    for (const registeredRoute of this.routeList) {
      if (seen.has(registeredRoute)) continue;
      if (!matchesMethod(registeredRoute)) continue;
      const extractedParams = this.matchPath(registeredRoute, requestPath);
      if (extractedParams !== null) {
        return { route: registeredRoute, params: extractedParams };
      }
    }

    return null; // no matching route found
  }

  private compilePath(routePattern: string): { segments: string[] } {
    return {
      segments: routePattern.split("/").filter(Boolean)
    };
  }

  // Path matching logic - handles dynamic params like :id
  private matchPath(route: Route, actualPath: string): Record<string, string> | null {
    if (route.path === "*") {
      return {};
    }

    const compiled = route.compiled || this.compilePath(route.path);
    const routeParts = compiled.segments;
    const pathParts = actualPath.split("/").filter(s => s);

    if (routeParts.length !== pathParts.length) {
      return null; // different number of segments = no match
    }

    const extractedParams: Record<string, string> = {};

    for (let i = 0; i < routeParts.length; i++) {
      const routeSegment = routeParts[i];
      const pathSegment = pathParts[i];

      if (routeSegment.startsWith(":")) {
        // Dynamic parameter like :id or :userId
        const paramName = routeSegment.slice(1);
        extractedParams[paramName] = decodeURIComponent(pathSegment);
      } else if (routeSegment !== pathSegment) {
        return null; // literal segments must match exactly
      }
    }

    return extractedParams;
  }
}
