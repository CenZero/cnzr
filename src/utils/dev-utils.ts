import * as fs from "fs";

// Personal development utilities - karena gw males pake library besar
// Collection of handy functions yang sering gw butuhin

/**
 * Simple deep merge utility - replacement for lodash.merge
 * Gw bikin sendiri karena lodash terlalu heavy cuma buat merge object
 */
export const deepMerge = (target: any, source: any): any => {
  const result = { ...target };
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const sourceValue = source[key];
      const targetValue = result[key];
      
      if (isPlainObject(targetValue) && isPlainObject(sourceValue)) {
        result[key] = deepMerge(targetValue, sourceValue);
      } else {
        result[key] = sourceValue;
      }
    }
  }
  
  return result;
};

/**
 * Check if value is plain object - helper buat deep merge
 */
const isPlainObject = (obj: any): obj is Record<string, any> => {
  return obj && typeof obj === 'object' && obj.constructor === Object;
};

/**
 * Simple debounce function - buat rate limiting atau event handling
 * No need for lodash, ini simple implementation yang works
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Simple throttle function - complement buat debounce
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Format bytes to human readable string
 * Sering dipake buat logging file sizes atau memory usage
 */
export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Simple retry mechanism with exponential backoff
 * Useful buat network requests atau unreliable operations
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      // Exponential backoff - delay increases each attempt
      const waitTime = delay * Math.pow(2, attempt - 1);
      await sleep(waitTime);
    }
  }
  
  throw lastError!;
};

/**
 * Simple sleep function - Promise-based setTimeout
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Generate random string - useful buat IDs atau tokens
 * Custom implementation, ga perlu uuid library buat simple cases
 */
export const randomString = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

/**
 * Simple object pick utility - like lodash.pick
 * Extract specific properties from object
 */
export const pick = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  
  return result;
};

/**
 * Simple object omit utility - opposite of pick
 */
export const omit = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const result = { ...obj };
  
  for (const key of keys) {
    delete result[key];
  }
  
  return result;
};

/**
 * Check if string is valid JSON
 * Simple utility yang sering kepake
 */
export const isValidJSON = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

/**
 * Simple hash function - non-cryptographic
 * Useful buat caching keys atau simple checksums
 */
export const simpleHash = (str: string): string => {
  let hash = 0;
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash).toString(36);
};

/**
 * Development helper - log with timestamp and colors
 * Better than console.log buat debugging
 */
export const devLog = {
  info: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`ℹ️  [${new Date().toISOString()}] ${message}`, ...args);
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`⚠️  [${new Date().toISOString()}] ${message}`, ...args);
    }
  },
  
  error: (message: string, ...args: any[]) => {
    console.error(`❌ [${new Date().toISOString()}] ${message}`, ...args);
  },
  
  success: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ [${new Date().toISOString()}] ${message}`, ...args);
    }
  }
};

// Easter egg - random dev jokes for entertainment
export const getRandomDevJoke = (): string => {
  const jokes = [
    "Why do programmers prefer dark mode? Because light attracts bugs! 🐛",
    "There are only 10 types of people: those who understand binary and those who don't.",
    "Why did the developer go broke? Because he used up all his cache! 💰",
    "Programming is like sex: one mistake and you have to support it for life.",
    "99 little bugs in the code, 99 little bugs. Take one down, patch it around, 117 little bugs in the code.",
    "A SQL query goes into a bar, walks up to two tables and asks: 'Can I join you?'",
    "Kenapa programmer suka kopi? Karena tanpa kopi code-nya jadi Java-less!",
    "Debugging: Being the detective in a crime movie where you are also the murderer."
  ];
  
  return jokes[Math.floor(Math.random() * jokes.length)];
};

// Performance measurement utility
export const measure = async <T>(
  name: string,
  fn: () => Promise<T> | T
): Promise<T> => {
  const start = process.hrtime.bigint();
  const result = await fn();
  const end = process.hrtime.bigint();
  const duration = Number(end - start) / 1000000; // Convert to milliseconds
  
  devLog.info(`⏱️  ${name} took ${duration.toFixed(2)}ms`);
  
  return result;
};

/**
 * Simple diagnostics helper for development environments
 */
export const diagnostics = {
  checkNodeVersion: (minVersion: string = '14.0.0'): { valid: boolean; current: string; required: string } => {
    const current = process.version.replace(/^v/, '');
    const currentParts = current.split('.').map(Number);
    const minParts = minVersion.split('.').map(Number);

    let valid = true;
    for (let i = 0; i < 3; i++) {
      if ((currentParts[i] || 0) < (minParts[i] || 0)) {
        valid = false;
        break;
      }
      if ((currentParts[i] || 0) > (minParts[i] || 0)) {
        break;
      }
    }

    return {
      valid,
      current: process.version,
      required: minVersion,
    };
  },

  getEnvInfo: () => ({
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    nodeEnv: process.env.NODE_ENV || 'development',
    cwd: process.cwd(),
    pid: process.pid,
  }),

  checkRequiredEnvVars: (vars: string[]): { present: string[]; missing: string[] } => {
    const present: string[] = [];
    const missing: string[] = [];

    for (const name of vars) {
      if (process.env[name]) {
        present.push(name);
      } else {
        missing.push(name);
      }
    }

    return { present, missing };
  },
};

/**
 * Small performance profiler for dev measurement loops
 */
export class PerformanceProfiler {
  private timers = new Map<string, bigint>();
  private samples = new Map<string, number[]>();

  start(label: string): void {
    this.timers.set(label, process.hrtime.bigint());
  }

  end(label: string): number {
    const startedAt = this.timers.get(label);
    if (!startedAt) return 0;

    const duration = Number(process.hrtime.bigint() - startedAt) / 1000000;
    this.timers.delete(label);

    const existing = this.samples.get(label) || [];
    existing.push(duration);
    this.samples.set(label, existing);
    return duration;
  }

  getStats(label: string): { count: number; min: number; max: number; avg: number; total: number } | null {
    const values = this.samples.get(label);
    if (!values || values.length === 0) return null;

    const total = values.reduce((sum, value) => sum + value, 0);
    return {
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: total / values.length,
      total,
    };
  }

  clear(): void {
    this.timers.clear();
    this.samples.clear();
  }
}

/**
 * ANSI color helpers for CLI developer tooling
 */
export const colors = {
  error: (text: string) => `\x1b[31m${text}\x1b[0m`,
  success: (text: string) => `\x1b[32m${text}\x1b[0m`,
  warn: (text: string) => `\x1b[33m${text}\x1b[0m`,
  info: (text: string) => `\x1b[36m${text}\x1b[0m`,
  strong: (text: string) => `\x1b[1m${text}\x1b[0m`,
};

/**
 * Tiny request timer utility for profiling request phases
 */
export class RequestTimer {
  private readonly startedAt: bigint;
  private marks = new Map<string, bigint>();
  readonly label: string;

  constructor(label: string = `request_${Date.now()}`) {
    this.label = label;
    this.startedAt = process.hrtime.bigint();
  }

  mark(name: string): void {
    this.marks.set(name, process.hrtime.bigint());
  }

  getElapsed(): number {
    return Number(process.hrtime.bigint() - this.startedAt) / 1000000;
  }

  getMarkDuration(from: string, to: string): number {
    const fromMark = this.marks.get(from);
    const toMark = this.marks.get(to);
    if (!fromMark || !toMark) return 0;
    return Number(toMark - fromMark) / 1000000;
  }

  getReport(): { label: string; totalTime: number; marks: { name: string; elapsed: number }[] } {
    return {
      label: this.label,
      totalTime: this.getElapsed(),
      marks: Array.from(this.marks.entries()).map(([name, timestamp]) => ({
        name,
        elapsed: Number(timestamp - this.startedAt) / 1000000,
      })),
    };
  }
}

/**
 * Minimal wrapper around fs.watch for local dev workflows
 */
export class SimpleFileWatcher {
  private watchers = new Map<string, fs.FSWatcher>();

  watch(filePath: string, callback: (event: 'change' | 'rename') => void): () => void {
    if (this.watchers.has(filePath)) {
      return () => undefined;
    }

    const watcher = fs.watch(filePath, (event) => {
      callback(event as 'change' | 'rename');
    });

    this.watchers.set(filePath, watcher);

    return () => {
      watcher.close();
      this.watchers.delete(filePath);
    };
  }

  unwatchAll(): void {
    for (const watcher of this.watchers.values()) {
      watcher.close();
    }
    this.watchers.clear();
  }
}
