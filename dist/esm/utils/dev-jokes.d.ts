/**
 * Random programming jokes - mix bahasa Indonesia sama English
 */
export declare const DEV_JOKES: string[];
export declare const DEV_MOTIVATION: string[];
export declare const DEV_SLANG: string[];
export declare const ASCII_BANNERS: string[];
/**
 * Main class buat handle semua jokes dan fun stuff
 * Gw bikin class biar lebih terorganisir (dan keliatan pro)
 */
export declare class DevJokes {
    static getRandomJoke(): string;
    static getRandomMotivation(): string;
    static getRandomSlang(): string;
    static getMorningVibes(): string;
    static detectEasterEgg(input: string): string | null;
    static getRandomBanner(): string;
}
export declare const getRandomJoke: () => string;
export declare const getRandomMotivation: () => string;
export declare const getMorningVibes: () => string;
export declare const getRandomSlang: () => string;
export declare const detectEasterEgg: (input: string) => string | null;
export declare const getRandomBanner: () => string;
//# sourceMappingURL=dev-jokes.d.ts.map