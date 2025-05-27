import { CenzeroRequest, CenzeroResponse } from './types';
import { CenzeroContext } from './context';
export interface ErrorInfo {
    error: Error;
    statusCode?: number;
    timestamp: Date;
    method: string;
    path: string;
    userAgent?: string;
    clientIp?: string;
    severity?: string;
}
export type ErrorHandler = (error: Error, req: CenzeroRequest, res: CenzeroResponse, next?: () => void) => void | Promise<void>;
export type ContextErrorHandler = (error: Error, ctx: CenzeroContext, next?: () => Promise<void>) => void | Promise<void>;
export declare class ErrorHandlerManager {
    private myCustomHandlers;
    private useContextMode;
    constructor(useContext?: boolean);
    /**
     * Daftarin custom error handler
     * NOTE: Handler baru dapet prioritas lebih tinggi - FIFO approach
     * Ini design decision gw, soalnya biasanya developer pengen override yang terbaru
     */
    register(errorHandler: ErrorHandler | ContextErrorHandler): void;
    /**
     * Main error handling logic - ini bagian yang paling penting
     * Sempet mikir mau bikin ini async/await semua, tapi takut breaking
     */
    handle(error: Error, req: CenzeroRequest, res: CenzeroResponse, ctx?: CenzeroContext): Promise<void>;
    /**
     * Setup default error handler - ini yang bikin framework tetep jalan walau user ga setup apapun
     */
    private initDefaultHandling;
    /**
     * Default error handler for legacy mode - yang klasik tapi reliable
     * Honestly ini approach simple tapi works in most cases
     */
    private defaultHandler;
    /**
     * Default error handler for context mode - same logic tapi pake context
     * TODO: mungkin bisa di-refactor jadi satu function aja, tapi biar jelas dulu
     */
    private defaultContextHandler;
    /**
     * Send default error response - last resort kalo semua gagal
     * Ini yang dipanggil kalo custom handler ga ada yang handle
     */
    private sendDefaultErrorResponse;
    /**
     * Extract status code from error - with some magic detection
     * Ini function kecil tapi penting banget buat proper HTTP status
     */
    private getStatusCode;
    /**
     * Get client IP address - lebih thorough detection
     * Ini penting buat logging dan rate limiting
     */
    private getClientIP;
    /**
     * Log error information - with personal flair
     * Kadang gw suka liat error log yang terlalu plain, jadi bikin yang lebih informatif
     */
    private logError;
    /**
     * Create error instances dengan status codes
     * Simple utility tapi berguna banget buat consistency
     */
    static createError(message: string, statusCode?: number): Error;
    static badRequest(message?: string): Error;
    static unauthorized(message?: string): Error;
    static forbidden(message?: string): Error;
    static notFound(message?: string): Error;
    static methodNotAllowed(message?: string): Error;
    static conflict(message?: string): Error;
    static validationError(message?: string): Error;
    static internalServerError(message?: string): Error;
    static serviceUnavailable(message?: string): Error;
    static rateLimited(message?: string): Error;
    static payloadTooLarge(message?: string): Error;
}
export declare const createError: typeof ErrorHandlerManager.createError;
export declare const badRequest: typeof ErrorHandlerManager.badRequest, unauthorized: typeof ErrorHandlerManager.unauthorized, forbidden: typeof ErrorHandlerManager.forbidden, notFound: typeof ErrorHandlerManager.notFound, methodNotAllowed: typeof ErrorHandlerManager.methodNotAllowed, conflict: typeof ErrorHandlerManager.conflict, validationError: typeof ErrorHandlerManager.validationError, internalServerError: typeof ErrorHandlerManager.internalServerError, serviceUnavailable: typeof ErrorHandlerManager.serviceUnavailable, rateLimited: typeof ErrorHandlerManager.rateLimited, payloadTooLarge: typeof ErrorHandlerManager.payloadTooLarge;
//# sourceMappingURL=error-handler.d.ts.map