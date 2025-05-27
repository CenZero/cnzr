import { IncomingMessage, ServerResponse } from 'http';

export interface CookieOptions {
  maxAge?: number;
  expires?: Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

export class Cookies {
  private req: IncomingMessage;
  private res: ServerResponse;
  private parsed: Record<string, string> = {};

  constructor(req: IncomingMessage, res: ServerResponse) {
    this.req = req;
    this.res = res;
    this.parseCookies();
  }

  private parseCookies(): void {
    const cookieHeader = this.req.headers.cookie;
    if (!cookieHeader) return;

    cookieHeader.split(';').forEach(cookie => {
      const [name, ...rest] = cookie.trim().split('=');
      if (name && rest.length > 0) {
        this.parsed[name] = decodeURIComponent(rest.join('='));
      }
    });
  }

  get(name: string): string | undefined {
    return this.parsed[name];
  }

  set(name: string, value: string, options: CookieOptions = {}): void {
    let cookieString = `${name}=${encodeURIComponent(value)}`;

    if (options.maxAge !== undefined) {
      cookieString += `; Max-Age=${options.maxAge}`;
    }

    if (options.expires) {
      cookieString += `; Expires=${options.expires.toUTCString()}`;
    }

    if (options.path) {
      cookieString += `; Path=${options.path}`;
    }

    if (options.domain) {
      cookieString += `; Domain=${options.domain}`;
    }

    if (options.secure) {
      cookieString += '; Secure';
    }

    if (options.httpOnly) {
      cookieString += '; HttpOnly';
    }

    if (options.sameSite) {
      cookieString += `; SameSite=${options.sameSite}`;
    }

    // Get existing Set-Cookie headers
    const existingHeaders = this.res.getHeader('Set-Cookie');
    const headers = Array.isArray(existingHeaders) 
      ? existingHeaders 
      : existingHeaders 
        ? [existingHeaders as string]
        : [];

    headers.push(cookieString);
    this.res.setHeader('Set-Cookie', headers);
  }

  delete(name: string, options: Omit<CookieOptions, 'maxAge' | 'expires'> = {}): void {
    this.set(name, '', {
      ...options,
      expires: new Date(0)
    });
  }

  clear(): void {
    Object.keys(this.parsed).forEach(name => {
      this.delete(name);
    });
  }

  all(): Record<string, string> {
    return { ...this.parsed };
  }
}
