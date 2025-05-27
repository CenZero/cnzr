"use strict";
// Personal development utilities - karena gw males pake library besar
// Collection of handy functions yang sering gw butuhin
Object.defineProperty(exports, "__esModule", { value: true });
exports.measure = exports.getRandomDevJoke = exports.devLog = exports.simpleHash = exports.isValidJSON = exports.omit = exports.pick = exports.randomString = exports.sleep = exports.retry = exports.formatBytes = exports.throttle = exports.debounce = exports.deepMerge = void 0;
/**
 * Simple deep merge utility - replacement for lodash.merge
 * Gw bikin sendiri karena lodash terlalu heavy cuma buat merge object
 */
const deepMerge = (target, source) => {
    const result = { ...target };
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            const sourceValue = source[key];
            const targetValue = result[key];
            if (isPlainObject(targetValue) && isPlainObject(sourceValue)) {
                result[key] = (0, exports.deepMerge)(targetValue, sourceValue);
            }
            else {
                result[key] = sourceValue;
            }
        }
    }
    return result;
};
exports.deepMerge = deepMerge;
/**
 * Check if value is plain object - helper buat deep merge
 */
const isPlainObject = (obj) => {
    return obj && typeof obj === 'object' && obj.constructor === Object;
};
/**
 * Simple debounce function - buat rate limiting atau event handling
 * No need for lodash, ini simple implementation yang works
 */
const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};
exports.debounce = debounce;
/**
 * Simple throttle function - complement buat debounce
 */
const throttle = (func, limit) => {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};
exports.throttle = throttle;
/**
 * Format bytes to human readable string
 * Sering dipake buat logging file sizes atau memory usage
 */
const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};
exports.formatBytes = formatBytes;
/**
 * Simple retry mechanism with exponential backoff
 * Useful buat network requests atau unreliable operations
 */
const retry = async (fn, maxAttempts = 3, delay = 1000) => {
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            if (attempt === maxAttempts) {
                throw lastError;
            }
            // Exponential backoff - delay increases each attempt
            const waitTime = delay * Math.pow(2, attempt - 1);
            await (0, exports.sleep)(waitTime);
        }
    }
    throw lastError;
};
exports.retry = retry;
/**
 * Simple sleep function - Promise-based setTimeout
 */
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
exports.sleep = sleep;
/**
 * Generate random string - useful buat IDs atau tokens
 * Custom implementation, ga perlu uuid library buat simple cases
 */
const randomString = (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};
exports.randomString = randomString;
/**
 * Simple object pick utility - like lodash.pick
 * Extract specific properties from object
 */
const pick = (obj, keys) => {
    const result = {};
    for (const key of keys) {
        if (key in obj) {
            result[key] = obj[key];
        }
    }
    return result;
};
exports.pick = pick;
/**
 * Simple object omit utility - opposite of pick
 */
const omit = (obj, keys) => {
    const result = { ...obj };
    for (const key of keys) {
        delete result[key];
    }
    return result;
};
exports.omit = omit;
/**
 * Check if string is valid JSON
 * Simple utility yang sering kepake
 */
const isValidJSON = (str) => {
    try {
        JSON.parse(str);
        return true;
    }
    catch {
        return false;
    }
};
exports.isValidJSON = isValidJSON;
/**
 * Simple hash function - non-cryptographic
 * Useful buat caching keys atau simple checksums
 */
const simpleHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
};
exports.simpleHash = simpleHash;
/**
 * Development helper - log with timestamp and colors
 * Better than console.log buat debugging
 */
exports.devLog = {
    info: (message, ...args) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(`ℹ️  [${new Date().toISOString()}] ${message}`, ...args);
        }
    },
    warn: (message, ...args) => {
        if (process.env.NODE_ENV === 'development') {
            console.warn(`⚠️  [${new Date().toISOString()}] ${message}`, ...args);
        }
    },
    error: (message, ...args) => {
        console.error(`❌ [${new Date().toISOString()}] ${message}`, ...args);
    },
    success: (message, ...args) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(`✅ [${new Date().toISOString()}] ${message}`, ...args);
        }
    }
};
// Easter egg - random dev jokes for entertainment
const getRandomDevJoke = () => {
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
exports.getRandomDevJoke = getRandomDevJoke;
// Performance measurement utility
const measure = async (name, fn) => {
    const start = process.hrtime.bigint();
    const result = await fn();
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000; // Convert to milliseconds
    exports.devLog.info(`⏱️  ${name} took ${duration.toFixed(2)}ms`);
    return result;
};
exports.measure = measure;
//# sourceMappingURL=dev-utils.js.map