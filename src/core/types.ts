import { IncomingMessage, ServerResponse } from 'http';

// Core request interface - extend dari Node.js IncomingMessage
// Tambahan properties yang biasa gw butuhin dalam daily development
export interface CenzeroRequest extends IncomingMessage {
  params?: Record<string, string>; // Route parameters (dynamic segments)
  query?: Record<string, string>; // URL query parameters  
  body?: any; // Request body - any type karena bisa JSON, form-data, dll
  path?: string; // Clean path tanpa query string
  method?: string; // HTTP method - redundant dengan IncomingMessage tapi sometimes useful
  url?: string; // Full URL
  // TODO: nanti bisa tambahin cookies, session, dll
}

// Response interface dengan convenience methods
// Inspired by Express tapi simpler dan sesuai kebutuhan
export interface CenzeroResponse extends ServerResponse {
  json(data: any): void; // Send JSON response - yang paling sering dipake
  html(content: string): void; // Send HTML content
  redirect(url: string, statusCode?: number): void; // Redirect response
  status(code: number): CenzeroResponse; // Set status code (chainable)
  send(data: any): void; // Generic send method
  // NOTE: sengaja ga tambahin terlalu banyak method biar tetep simple
}

// Classic Express-style middleware - 3 parameter approach
// Ini yang udah familiar sama semua developer
export type MiddlewareFunction = (
  req: CenzeroRequest,
  res: CenzeroResponse,
  next: () => void
) => void | Promise<void>;

// Context-based middleware - modern approach
// Lebih clean karena semua ada di satu object
export type ContextMiddlewareFunction = (
  ctx: import('./context').CenzeroContext,
  next: () => Promise<void>
) => void | Promise<void>;

// Route handlers - dua style buat compatibility
export type RouteHandler = (
  req: CenzeroRequest,
  res: CenzeroResponse
) => void | Promise<void>;

export type ContextRouteHandler = (
  ctx: import('./context').CenzeroContext
) => void | Promise<void>;

// Route definition structure
// Ini yang dipake internal buat nyimpen route info
export interface Route {
  method: string;
  path: string;
  handler: RouteHandler | ContextRouteHandler;
  middlewares: (MiddlewareFunction | ContextMiddlewareFunction)[]; // Per-route middlewares
  useContext?: boolean; // Flag buat nentuin style mana yang dipake
}

export interface RouterOptions {
  prefix?: string; // Path prefix buat grouped routes
  // Future: bisa tambahin baseUrl, version, dll
}

// HTTP methods - yang supported sama framework
// Sengaja pake union type biar type-safe
export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';

// Convenience aliases - biar ga bingung nama
export type Handler = RouteHandler;
export type ContextHandler = ContextRouteHandler;

// Main framework options - ini yang dipake di constructor
export interface CenzeroOptions {
  port?: number; // Default 3000
  host?: string; // Default localhost
  staticDir?: string; // Static files directory
  viewEngine?: string; // Template engine (future feature)
  viewsDir?: string; // Views directory (future feature)
  useContext?: boolean; // Global context mode toggle
  useFileRouting?: boolean; // File-based routing like Next.js
  routesDir?: string; // Directory buat file routing
  debug?: boolean; // Debug mode dengan extra logging
  // TODO: bisa tambahin cors options, rate limiting, dll
}
