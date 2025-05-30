// NOTE: Main exports for the Cenzero framework
// Had to organize these manually since auto-import was being weird

export { CenzeroApp } from "./core/server";
export { Router } from "./core/router";
export { FileRouter } from "./core/file-router";
export { ErrorHandlerManager, createError, badRequest, unauthorized, forbidden, notFound, methodNotAllowed, conflict, validationError, internalServerError, serviceUnavailable } from "./core/error-handler";
export { CenzeroContext } from "./core/context";
export { Logger } from "./core/logger";
export { CorsOptions, cors } from "./core/cors";
export { PluginManager } from "./core/plugin";
export * from "./core/types";
export * from "./plugins";

// Middleware exports - the commonly used ones
export { loggerMiddleware, createLoggerMiddleware } from "./middleware/logger";
export { corsMiddleware, createCorsMiddleware, corsWithOrigins, corsWithCredentials } from "./middleware/cors";
export { responseTimeMiddleware, createResponseTimeMiddleware, preciseResponseTime, responseTimeWithLogging, createCustomResponseTime, createFormattedResponseTime } from "./middleware/response-time";

// Dev utilities exports - personal fun stuff dan custom utilities
export { getRandomJoke, getRandomMotivation, getMorningVibes, getRandomSlang, detectEasterEgg, getRandomBanner } from "./utils/dev-jokes";
export { deepMerge, debounce, throttle, retry, formatBytes, randomString, pick, omit, devLog, measure } from "./utils/dev-utils";

// Default export for convenience - most people probably want this
export { CenzeroApp as default } from "./core/server";
