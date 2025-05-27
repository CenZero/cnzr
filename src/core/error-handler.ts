import { CenzeroRequest, CenzeroResponse } from './types';
import { CenzeroContext } from './context';

// Custom error reporting utilities - karena gw males pake winston atau library besar lain
const ErrorUtils = {
  // Quote random biar hidup ga terlalu serius
  getRandomQuote: () => {
    const quotes = [
      "Debugging is like being a detective in a crime movie where you are also the murderer.",
      "There are two hard things in programming: cache invalidation, naming things, and off-by-one errors.",
      "If debugging is the process of removing bugs, then programming must be the process of putting them in.",
      "Kadang error itu blessing in disguise, maksa kita nulis code yang lebih bagus"
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  },
  
  // Custom timestamp formatter - simple aja, ga usah moment.js
  formatTime: (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
           `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  },
  
  // Karena gw suka tau context lebih detail
  getErrorSeverity: (statusCode: number) => {
    if (statusCode < 400) return 'info';
    if (statusCode < 500) return 'warning'; 
    return 'critical';
  }
};

export interface ErrorInfo {
  error: Error;
  statusCode?: number;
  timestamp: Date;
  method: string;
  path: string;
  userAgent?: string;
  clientIp?: string; // renamed for clarity
  severity?: string; // tambahan buat personal touch
}

export type ErrorHandler = (
  error: Error,
  req: CenzeroRequest,
  res: CenzeroResponse,
  next?: () => void
) => void | Promise<void>;

export type ContextErrorHandler = (
  error: Error,
  ctx: CenzeroContext,
  next?: () => Promise<void>
) => void | Promise<void>;

export class ErrorHandlerManager {
  private myCustomHandlers: (ErrorHandler | ContextErrorHandler)[] = []; // lebih personal daripada "customErrorHandlers"
  private useContextMode: boolean; // lebih deskriptif

  constructor(useContext: boolean = false) {
    this.useContextMode = useContext;
    this.initDefaultHandling(); // ganti nama biar lebih natural
  }

  /**
   * Daftarin custom error handler
   * NOTE: Handler baru dapet prioritas lebih tinggi - FIFO approach
   * Ini design decision gw, soalnya biasanya developer pengen override yang terbaru
   */
  register(errorHandler: ErrorHandler | ContextErrorHandler): void {
    this.myCustomHandlers.unshift(errorHandler); // Add to beginning for priority
  }

  /**
   * Main error handling logic - ini bagian yang paling penting
   * Sempet mikir mau bikin ini async/await semua, tapi takut breaking
   */
  async handle(
    error: Error,
    req: CenzeroRequest,
    res: CenzeroResponse,
    ctx?: CenzeroContext
  ): Promise<void> {
    const errorDetails: ErrorInfo = {
      error,
      statusCode: this.getStatusCode(error), // keep original method name
      timestamp: new Date(),
      method: req.method || 'UNKNOWN',
      path: req.url || '/',
      userAgent: req.headers['user-agent'],
      clientIp: this.getClientIP(req), // fix property name
      severity: ErrorUtils.getErrorSeverity(this.getStatusCode(error))
    };

    // Log dengan style personal
    this.logError(errorDetails);

    // Try custom handlers first - ini yang bikin framework flexible
    for (const handler of this.myCustomHandlers) {
      try {
        if (this.useContextMode && ctx) {
          await (handler as ContextErrorHandler)(error, ctx);
        } else {
          await (handler as ErrorHandler)(error, req, res);
        }
        
        // Kalo response udah dikirim, stop processing
        if (res.headersSent) {
          return;
        }
      } catch (handlerError) {
        console.error('🚨 Error in error handler (inception vibes):', handlerError);
        continue; // Try next handler - defensive programming
      }
    }

    // Fallback kalo semua handler gagal
    if (!res.headersSent) {
      this.sendDefaultErrorResponse(res, errorDetails);
    }
  }

  /**
   * Setup default error handler - ini yang bikin framework tetep jalan walau user ga setup apapun
   */
  private initDefaultHandling(): void {
    const defaultHandler = this.useContextMode ? this.defaultContextHandler : this.defaultHandler;
    this.myCustomHandlers.push(defaultHandler);
  }

  /**
   * Default error handler for legacy mode - yang klasik tapi reliable
   * Honestly ini approach simple tapi works in most cases
   */
  private defaultHandler: ErrorHandler = (error, req, res) => {
    if (res.headersSent) return; // defensive programming - learned this the hard way

    const statusCode = this.getStatusCode(error);
    const isDev = process.env.NODE_ENV === 'development';

    // Custom error response format - biar konsisten dengan style gw
    const errorResponse = {
      success: false, // gw lebih suka explicit success flag
      error: error.message || 'Something went wrong on our end',
      statusCode,
      timestamp: new Date().toISOString(),
      path: req.url,
      // Stack trace cuma di dev environment
      ...(isDev && { 
        stack: error.stack,
        tip: "Check the server logs for more details" // personal touch
      })
    };

    res.status(statusCode).json(errorResponse);
  };

  /**
   * Default error handler for context mode - same logic tapi pake context
   * TODO: mungkin bisa di-refactor jadi satu function aja, tapi biar jelas dulu
   */
  private defaultContextHandler: ContextErrorHandler = (error, ctx) => {
    if (ctx.res.headersSent) return;

    const statusCode = this.getStatusCode(error);
    const isDev = process.env.NODE_ENV === 'development';

    const errorResponse = {
      success: false,
      error: error.message || 'Something went wrong on our end',
      statusCode,
      timestamp: new Date().toISOString(),
      path: ctx.req.url,
      ...(isDev && { 
        stack: error.stack,
        tip: "Check the server logs for more details"
      })
    };

    ctx.status(statusCode).json(errorResponse);
  };

  /**
   * Send default error response - last resort kalo semua gagal
   * Ini yang dipanggil kalo custom handler ga ada yang handle
   */
  private sendDefaultErrorResponse(res: CenzeroResponse, errorInfo: ErrorInfo): void {
    const statusCode = errorInfo.statusCode || 500;
    const isDev = process.env.NODE_ENV === 'development';

    const errorResponse = {
      success: false,
      error: errorInfo.error.message || 'Internal Server Error',
      statusCode,
      timestamp: errorInfo.timestamp.toISOString(),
      path: errorInfo.path,
      // Development info
      ...(isDev && { 
        stack: errorInfo.error.stack,
        severity: errorInfo.severity,
        tip: "This is the fallback error handler. Consider adding a custom error handler."
      })
    };

    try {
      res.status(statusCode).json(errorResponse);
    } catch (e) {
      // Nuclear option - kalo JSON response juga gagal
      // Pernah kejadian gara-gara circular reference di error object
      console.error('🔥 Even JSON response failed, sending plain text:', e);
      res.writeHead(statusCode, { 'Content-Type': 'text/plain' });
      res.end(`Error: ${errorInfo.error.message}`);
    }
  }

  /**
   * Extract status code from error - with some magic detection
   * Ini function kecil tapi penting banget buat proper HTTP status
   */
  private getStatusCode(error: any): number {
    // Common property names for status codes
    if (error.statusCode) return error.statusCode;
    if (error.status) return error.status;
    if (error.code) {
      // File system errors - yang sering kejadian
      if (error.code === 'ENOENT') return 404;
      if (error.code === 'EACCES') return 403;
      if (error.code === 'EMFILE') return 503; // Too many open files
    }
    // Default ke 500 - safe fallback
    return 500;
  }

  /**
   * Get client IP address - lebih thorough detection
   * Ini penting buat logging dan rate limiting
   */
  private getClientIP(req: CenzeroRequest): string {
    // Cek berbagai headers yang mungkin ada IP
    const possibleIPs = [
      req.headers['x-forwarded-for'] as string,
      req.headers['x-real-ip'] as string,
      req.headers['x-client-ip'] as string, // some proxies use this
      req.connection?.remoteAddress,
      req.socket?.remoteAddress
    ].filter(Boolean);

    if (possibleIPs.length > 0) {
      // X-Forwarded-For bisa contain multiple IPs (comma-separated)
      const firstIP = possibleIPs[0];
      if (firstIP) {
        return Array.isArray(firstIP) 
          ? firstIP[0] 
          : firstIP.split(',')[0].trim();
      }
    }
    
    return 'unknown';
  }

  /**
   * Log error information - with personal flair
   * Kadang gw suka liat error log yang terlalu plain, jadi bikin yang lebih informatif
   */
  private logError(errorInfo: ErrorInfo): void {
    const { error, statusCode, timestamp, method, path, userAgent, clientIp, severity } = errorInfo;
    
    // Random quote di awal biar ga terlalu serius
    if (Math.random() < 0.1) { // 10% chance
      console.log(`💡 "${ErrorUtils.getRandomQuote()}"`);
    }
    
    const timeStr = ErrorUtils.formatTime(timestamp);
    const severityEmoji = severity === 'critical' ? '💥' : severity === 'warning' ? '⚠️' : 'ℹ️';
    
    console.error(`${severityEmoji} Error terjadi di ${timeStr}:`);
    console.error(`  Request: ${method} ${path}`);
    console.error(`  Status: ${statusCode} (${severity})`);
    console.error(`  IP: ${clientIp}`);
    if (userAgent) console.error(`  User-Agent: ${userAgent}`);
    console.error(`  Error: ${error.message}`);
    
    // Stack trace cuma di development - production ga usah, takut bocor info sensitive
    if (process.env.NODE_ENV === 'development' && error.stack) {
      console.error(`  Stack:\n${error.stack}`);
    }
  }

  /**
   * Create error instances dengan status codes
   * Simple utility tapi berguna banget buat consistency
   */
  static createError(message: string, statusCode: number = 500): Error {
    const error = new Error(message) as Error & { statusCode: number };
    error.statusCode = statusCode;
    return error;
  }

  // Personal collection of common error creators - yang sering gw pake
  // Lebih enak daripada harus inget status code manually

  static badRequest(message: string = 'Bad Request - cek lagi parameter yang dikirim'): Error {
    return this.createError(message, 400);
  }

  static unauthorized(message: string = 'Unauthorized - login dulu ya'): Error {
    return this.createError(message, 401);
  }

  static forbidden(message: string = 'Forbidden - ga ada akses buat ini'): Error {
    return this.createError(message, 403);
  }

  static notFound(message: string = 'Not Found - endpoint atau resource ga ada'): Error {
    return this.createError(message, 404);
  }

  static methodNotAllowed(message: string = 'Method Not Allowed - coba ganti HTTP method'): Error {
    return this.createError(message, 405);
  }

  static conflict(message: string = 'Conflict - data udah ada atau lagi diproses'): Error {
    return this.createError(message, 409);
  }

  static validationError(message: string = 'Validation Error - data yang dikirim ga valid'): Error {
    return this.createError(message, 422);
  }

  static internalServerError(message: string = 'Internal Server Error - ada masalah di server'): Error {
    return this.createError(message, 500);
  }

  static serviceUnavailable(message: string = 'Service Unavailable - server lagi maintenance'): Error {
    return this.createError(message, 503);
  }

  // Bonus error creators yang kadang kepake
  static rateLimited(message: string = 'Too Many Requests - slow down bro'): Error {
    return this.createError(message, 429);
  }

  static payloadTooLarge(message: string = 'Payload Too Large - file atau data kegedean'): Error {
    return this.createError(message, 413);
  }
}

// Utility exports - biar bisa dipake di mana-mana tanpa import class
export const createError = ErrorHandlerManager.createError;

// Destructured exports - lebih convenient buat daily use
export const {
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  methodNotAllowed,
  conflict,
  validationError,
  internalServerError,
  serviceUnavailable,
  rateLimited,
  payloadTooLarge
} = ErrorHandlerManager;

// ASCII art untuk fun - karena error handling ga harus boring
console.log(`
     _____ _____ _   _ _____ _____ ____   ___  
    /  __ \\  ___| \\ | |__  /|  ___| __ \\ / _ \\ 
    | /  \\/| |__ |  \\| | / / | |__ |    || |_| |
    | |    |  __|| . \` |/ /  |  __||    ||  _  |
    | \\__/\\| |___| |\\  / /___| |___|    || | | |
     \\____/\\____/\\_| \\_/_____|\\____/ |__||_| |_|
    
    🛠️  Error Handler loaded - siap handle semua chaos!
`);
