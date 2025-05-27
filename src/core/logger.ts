import { CenzeroContext } from './context';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LoggerOptions {
  level?: LogLevel;
  format?: 'simple' | 'json' | 'combined';
  timestamp?: boolean;
  colors?: boolean;
  silent?: boolean;
  customFormat?: (ctx: CenzeroContext, responseTime: number) => string;
}

export class Logger {
  private options: LoggerOptions & { 
    level: LogLevel; 
    format: 'simple' | 'json' | 'combined'; 
    timestamp: boolean; 
    colors: boolean; 
    silent: boolean; 
  };
  private levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  };

  private colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
  };

  constructor(options: LoggerOptions = {}) {
    this.options = {
      level: options.level || 'info',
      format: options.format || 'simple',
      timestamp: options.timestamp !== false,
      colors: options.colors !== false,
      silent: options.silent || false,
      customFormat: options.customFormat
    };
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.options.silent) return false;
    return this.levels[level] >= this.levels[this.options.level];
  }

  private colorize(text: string, color: keyof typeof this.colors): string {
    if (!this.options.colors) return text;
    return `${this.colors[color]}${text}${this.colors.reset}`;
  }

  private formatTimestamp(): string {
    return this.options.timestamp ? `[${new Date().toISOString()}]` : '';
  }

  private getStatusColor(status: number): keyof typeof this.colors {
    if (status >= 200 && status < 300) return 'green';
    if (status >= 300 && status < 400) return 'cyan';
    if (status >= 400 && status < 500) return 'yellow';
    return 'red';
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = this.formatTimestamp();
    const levelStr = this.colorize(level.toUpperCase().padEnd(5), 
      level === 'error' ? 'red' : 
      level === 'warn' ? 'yellow' : 
      level === 'info' ? 'blue' : 'white'
    );

    if (this.options.format === 'json') {
      return JSON.stringify({
        timestamp: timestamp || new Date().toISOString(),
        level,
        message,
        ...data
      });
    }

    const parts = [timestamp, levelStr, message].filter(Boolean);
    return parts.join(' ') + (data ? ` ${JSON.stringify(data)}` : '');
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message, data));
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', message, data));
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, data));
    }
  }

  error(message: string, data?: any): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, data));
    }
  }

  // Request/Response logging middleware
  middleware() {
    return async (ctx: CenzeroContext, next: () => Promise<void>) => {
      const start = Date.now();
      
      // Log request
      this.info(`${ctx.method} ${ctx.path}`, {
        userAgent: ctx.get('user-agent'),
        ip: ctx.req.socket.remoteAddress
      });

      await next();

      // Log response
      const responseTime = Date.now() - start;
      const status = ctx.res.statusCode;
      const statusColor = this.getStatusColor(status);

      if (this.options.customFormat) {
        const formatted = this.options.customFormat(ctx, responseTime);
        console.log(formatted);
      } else {
        const statusStr = this.colorize(status.toString(), statusColor);
        const methodStr = this.colorize(ctx.method.padEnd(6), 'white');
        const timeStr = this.colorize(`${responseTime}ms`, 'dim');
        
        this.info(`${methodStr} ${ctx.path} ${statusStr} - ${timeStr}`);
      }

      // Set response time header
      ctx.set('X-Response-Time', `${responseTime}ms`);
    };
  }

  // Static factory method
  static create(options?: LoggerOptions): Logger {
    return new Logger(options);
  }
}
