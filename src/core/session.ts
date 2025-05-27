import { Cookies } from './cookies';
import { randomBytes, createHash } from 'crypto';

export interface SessionOptions {
  name?: string;
  secret?: string;
  maxAge?: number;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

export interface SessionData {
  [key: string]: any;
}

export class Session {
  private cookies: Cookies;
  private options: Required<SessionOptions>;
  private data: SessionData = {};
  private sessionId: string | null = null;
  private dirty = false;
  private static store: Map<string, { data: SessionData; expires: number }> = new Map();

  constructor(cookies: Cookies, options: SessionOptions = {}) {
    this.cookies = cookies;
    this.options = {
      name: options.name || 'cenzero-session',
      secret: options.secret || 'cenzero-default-secret',
      maxAge: options.maxAge || 24 * 60 * 60 * 1000, // 24 hours
      secure: options.secure || false,
      httpOnly: options.httpOnly !== false,
      sameSite: options.sameSite || 'lax'
    };

    this.loadSession();
  }

  private loadSession(): void {
    const sessionCookie = this.cookies.get(this.options.name);
    
    if (sessionCookie) {
      try {
        this.sessionId = this.verifySessionId(sessionCookie);
        if (this.sessionId) {
          const sessionEntry = Session.store.get(this.sessionId);
          if (sessionEntry && sessionEntry.expires > Date.now()) {
            this.data = sessionEntry.data;
            return;
          } else if (sessionEntry) {
            // Session expired, clean up
            Session.store.delete(this.sessionId);
          }
        }
      } catch (error) {
        // Invalid session cookie
      }
    }

    // Create new session
    this.createNewSession();
  }

  private createNewSession(): void {
    this.sessionId = this.generateSessionId();
    this.data = {};
    this.dirty = true;
  }

  private generateSessionId(): string {
    const timestamp = Date.now().toString();
    const random = randomBytes(16).toString('hex');
    const payload = `${timestamp}:${random}`;
    const signature = this.sign(payload);
    return `${payload}.${signature}`;
  }

  private sign(value: string): string {
    return createHash('sha256')
      .update(value + this.options.secret)
      .digest('hex')
      .substring(0, 16);
  }

  private verifySessionId(sessionId: string): string | null {
    const parts = sessionId.split('.');
    if (parts.length !== 2) return null;

    const [payload, signature] = parts;
    const expectedSignature = this.sign(payload);
    
    if (signature !== expectedSignature) return null;

    return sessionId;
  }

  get(key: string): any {
    return this.data[key];
  }

  set(key: string, value: any): void {
    this.data[key] = value;
    this.dirty = true;
  }

  clear(): void {
    this.data = {};
    this.dirty = true;
  }

  delete(key: string): void {
    delete this.data[key];
    this.dirty = true;
  }

  destroy(): void {
    if (this.sessionId) {
      Session.store.delete(this.sessionId);
      this.cookies.delete(this.options.name);
    }
    this.data = {};
    this.sessionId = null;
    this.dirty = false;
  }

  save(): void {
    if (!this.dirty || !this.sessionId) return;

    // Save to store
    Session.store.set(this.sessionId, {
      data: { ...this.data },
      expires: Date.now() + this.options.maxAge
    });

    // Set cookie
    this.cookies.set(this.options.name, this.sessionId, {
      maxAge: Math.floor(this.options.maxAge / 1000),
      secure: this.options.secure,
      httpOnly: this.options.httpOnly,
      sameSite: this.options.sameSite
    });

    this.dirty = false;
  }

  regenerate(): void {
    const oldData = { ...this.data };
    this.destroy();
    this.createNewSession();
    this.data = oldData;
    this.save();
  }

  // Getter/Setter for easier access
  get id(): string | null {
    return this.sessionId;
  }

  get all(): SessionData {
    return { ...this.data };
  }

  // Clean up expired sessions (should be called periodically)
  static cleanup(): void {
    const now = Date.now();
    const entries = Array.from(Session.store.entries());
    for (const [sessionId, entry] of entries) {
      if (entry.expires <= now) {
        Session.store.delete(sessionId);
      }
    }
  }
}
