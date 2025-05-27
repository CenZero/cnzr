/**
 * Simple deep merge utility - replacement for lodash.merge
 * Gw bikin sendiri karena lodash terlalu heavy cuma buat merge object
 */
export declare const deepMerge: (target: any, source: any) => any;
/**
 * Simple debounce function - buat rate limiting atau event handling
 * No need for lodash, ini simple implementation yang works
 */
export declare const debounce: <T extends (...args: any[]) => any>(func: T, wait: number) => ((...args: Parameters<T>) => void);
/**
 * Simple throttle function - complement buat debounce
 */
export declare const throttle: <T extends (...args: any[]) => any>(func: T, limit: number) => ((...args: Parameters<T>) => void);
/**
 * Format bytes to human readable string
 * Sering dipake buat logging file sizes atau memory usage
 */
export declare const formatBytes: (bytes: number, decimals?: number) => string;
/**
 * Simple retry mechanism with exponential backoff
 * Useful buat network requests atau unreliable operations
 */
export declare const retry: <T>(fn: () => Promise<T>, maxAttempts?: number, delay?: number) => Promise<T>;
/**
 * Simple sleep function - Promise-based setTimeout
 */
export declare const sleep: (ms: number) => Promise<void>;
/**
 * Generate random string - useful buat IDs atau tokens
 * Custom implementation, ga perlu uuid library buat simple cases
 */
export declare const randomString: (length?: number) => string;
/**
 * Simple object pick utility - like lodash.pick
 * Extract specific properties from object
 */
export declare const pick: <T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]) => Pick<T, K>;
/**
 * Simple object omit utility - opposite of pick
 */
export declare const omit: <T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]) => Omit<T, K>;
/**
 * Check if string is valid JSON
 * Simple utility yang sering kepake
 */
export declare const isValidJSON: (str: string) => boolean;
/**
 * Simple hash function - non-cryptographic
 * Useful buat caching keys atau simple checksums
 */
export declare const simpleHash: (str: string) => string;
/**
 * Development helper - log with timestamp and colors
 * Better than console.log buat debugging
 */
export declare const devLog: {
    info: (message: string, ...args: any[]) => void;
    warn: (message: string, ...args: any[]) => void;
    error: (message: string, ...args: any[]) => void;
    success: (message: string, ...args: any[]) => void;
};
export declare const getRandomDevJoke: () => string;
export declare const measure: <T>(name: string, fn: () => Promise<T> | T) => Promise<T>;
//# sourceMappingURL=dev-utils.d.ts.map