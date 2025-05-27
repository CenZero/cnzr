"use strict";
// NOTE: Main exports for the Cenzero framework
// Had to organize these manually since auto-import was being weird
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.measure = exports.devLog = exports.omit = exports.pick = exports.randomString = exports.formatBytes = exports.retry = exports.throttle = exports.debounce = exports.deepMerge = exports.getRandomBanner = exports.detectEasterEgg = exports.getRandomSlang = exports.getMorningVibes = exports.getRandomMotivation = exports.getRandomJoke = exports.createFormattedResponseTime = exports.createCustomResponseTime = exports.responseTimeWithLogging = exports.preciseResponseTime = exports.createResponseTimeMiddleware = exports.responseTimeMiddleware = exports.corsWithCredentials = exports.corsWithOrigins = exports.createCorsMiddleware = exports.corsMiddleware = exports.createLoggerMiddleware = exports.loggerMiddleware = exports.PluginManager = exports.cors = exports.Logger = exports.serviceUnavailable = exports.internalServerError = exports.validationError = exports.conflict = exports.methodNotAllowed = exports.notFound = exports.forbidden = exports.unauthorized = exports.badRequest = exports.createError = exports.ErrorHandlerManager = exports.FileRouter = exports.Router = exports.CenzeroApp = void 0;
var server_1 = require("./core/server");
Object.defineProperty(exports, "CenzeroApp", { enumerable: true, get: function () { return server_1.CenzeroApp; } });
var router_1 = require("./core/router");
Object.defineProperty(exports, "Router", { enumerable: true, get: function () { return router_1.Router; } });
var file_router_1 = require("./core/file-router");
Object.defineProperty(exports, "FileRouter", { enumerable: true, get: function () { return file_router_1.FileRouter; } });
var error_handler_1 = require("./core/error-handler");
Object.defineProperty(exports, "ErrorHandlerManager", { enumerable: true, get: function () { return error_handler_1.ErrorHandlerManager; } });
Object.defineProperty(exports, "createError", { enumerable: true, get: function () { return error_handler_1.createError; } });
Object.defineProperty(exports, "badRequest", { enumerable: true, get: function () { return error_handler_1.badRequest; } });
Object.defineProperty(exports, "unauthorized", { enumerable: true, get: function () { return error_handler_1.unauthorized; } });
Object.defineProperty(exports, "forbidden", { enumerable: true, get: function () { return error_handler_1.forbidden; } });
Object.defineProperty(exports, "notFound", { enumerable: true, get: function () { return error_handler_1.notFound; } });
Object.defineProperty(exports, "methodNotAllowed", { enumerable: true, get: function () { return error_handler_1.methodNotAllowed; } });
Object.defineProperty(exports, "conflict", { enumerable: true, get: function () { return error_handler_1.conflict; } });
Object.defineProperty(exports, "validationError", { enumerable: true, get: function () { return error_handler_1.validationError; } });
Object.defineProperty(exports, "internalServerError", { enumerable: true, get: function () { return error_handler_1.internalServerError; } });
Object.defineProperty(exports, "serviceUnavailable", { enumerable: true, get: function () { return error_handler_1.serviceUnavailable; } });
var logger_1 = require("./core/logger");
Object.defineProperty(exports, "Logger", { enumerable: true, get: function () { return logger_1.Logger; } });
var cors_1 = require("./core/cors");
Object.defineProperty(exports, "cors", { enumerable: true, get: function () { return cors_1.cors; } });
var plugin_1 = require("./core/plugin");
Object.defineProperty(exports, "PluginManager", { enumerable: true, get: function () { return plugin_1.PluginManager; } });
__exportStar(require("./core/types"), exports);
__exportStar(require("./plugins"), exports);
// Middleware exports - the commonly used ones
var logger_2 = require("./middleware/logger");
Object.defineProperty(exports, "loggerMiddleware", { enumerable: true, get: function () { return logger_2.loggerMiddleware; } });
Object.defineProperty(exports, "createLoggerMiddleware", { enumerable: true, get: function () { return logger_2.createLoggerMiddleware; } });
var cors_2 = require("./middleware/cors");
Object.defineProperty(exports, "corsMiddleware", { enumerable: true, get: function () { return cors_2.corsMiddleware; } });
Object.defineProperty(exports, "createCorsMiddleware", { enumerable: true, get: function () { return cors_2.createCorsMiddleware; } });
Object.defineProperty(exports, "corsWithOrigins", { enumerable: true, get: function () { return cors_2.corsWithOrigins; } });
Object.defineProperty(exports, "corsWithCredentials", { enumerable: true, get: function () { return cors_2.corsWithCredentials; } });
var response_time_1 = require("./middleware/response-time");
Object.defineProperty(exports, "responseTimeMiddleware", { enumerable: true, get: function () { return response_time_1.responseTimeMiddleware; } });
Object.defineProperty(exports, "createResponseTimeMiddleware", { enumerable: true, get: function () { return response_time_1.createResponseTimeMiddleware; } });
Object.defineProperty(exports, "preciseResponseTime", { enumerable: true, get: function () { return response_time_1.preciseResponseTime; } });
Object.defineProperty(exports, "responseTimeWithLogging", { enumerable: true, get: function () { return response_time_1.responseTimeWithLogging; } });
Object.defineProperty(exports, "createCustomResponseTime", { enumerable: true, get: function () { return response_time_1.createCustomResponseTime; } });
Object.defineProperty(exports, "createFormattedResponseTime", { enumerable: true, get: function () { return response_time_1.createFormattedResponseTime; } });
// Dev utilities exports - personal fun stuff dan custom utilities
var dev_jokes_1 = require("./utils/dev-jokes");
Object.defineProperty(exports, "getRandomJoke", { enumerable: true, get: function () { return dev_jokes_1.getRandomJoke; } });
Object.defineProperty(exports, "getRandomMotivation", { enumerable: true, get: function () { return dev_jokes_1.getRandomMotivation; } });
Object.defineProperty(exports, "getMorningVibes", { enumerable: true, get: function () { return dev_jokes_1.getMorningVibes; } });
Object.defineProperty(exports, "getRandomSlang", { enumerable: true, get: function () { return dev_jokes_1.getRandomSlang; } });
Object.defineProperty(exports, "detectEasterEgg", { enumerable: true, get: function () { return dev_jokes_1.detectEasterEgg; } });
Object.defineProperty(exports, "getRandomBanner", { enumerable: true, get: function () { return dev_jokes_1.getRandomBanner; } });
var dev_utils_1 = require("./utils/dev-utils");
Object.defineProperty(exports, "deepMerge", { enumerable: true, get: function () { return dev_utils_1.deepMerge; } });
Object.defineProperty(exports, "debounce", { enumerable: true, get: function () { return dev_utils_1.debounce; } });
Object.defineProperty(exports, "throttle", { enumerable: true, get: function () { return dev_utils_1.throttle; } });
Object.defineProperty(exports, "retry", { enumerable: true, get: function () { return dev_utils_1.retry; } });
Object.defineProperty(exports, "formatBytes", { enumerable: true, get: function () { return dev_utils_1.formatBytes; } });
Object.defineProperty(exports, "randomString", { enumerable: true, get: function () { return dev_utils_1.randomString; } });
Object.defineProperty(exports, "pick", { enumerable: true, get: function () { return dev_utils_1.pick; } });
Object.defineProperty(exports, "omit", { enumerable: true, get: function () { return dev_utils_1.omit; } });
Object.defineProperty(exports, "devLog", { enumerable: true, get: function () { return dev_utils_1.devLog; } });
Object.defineProperty(exports, "measure", { enumerable: true, get: function () { return dev_utils_1.measure; } });
// Default export for convenience - most people probably want this
var server_2 = require("./core/server");
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return server_2.CenzeroApp; } });
//# sourceMappingURL=index.js.map