// Development jokes and easter eggs - karena coding harus fun juga
// Collection of programming humor dan random quotes buat bikin hari lebih cerah
/**
 * Random programming jokes - mix bahasa Indonesia sama English
 */
export const DEV_JOKES = [
    "Why do programmers prefer dark mode? Because light attracts bugs! 🐛",
    "How many programmers does it take to change a light bulb? None, that's a hardware problem.",
    "Why do Java developers wear glasses? Because they can't C#! 🤓",
    "There are only 10 types of people: those who understand binary and those who don't.",
    "Programmer: A machine that turns coffee into code ☕",
    "Kenapa developer ga pernah capek? Karena selalu ada BREAK statement",
    "Bug: fitur yang belum didokumentasikan",
    "Code never lies, comments sometimes do",
    "Programming is like sex: one mistake and you have to support it for life",
    "The best error message: 'It works on my machine' 🤷‍♂️",
    "99 little bugs in the code, 99 little bugs. Take one down, patch it around, 117 little bugs in the code.",
    "A SQL query goes into a bar, walks up to two tables and asks: 'Can I join you?'",
    "Kenapa programmer suka kopi? Karena tanpa kopi code-nya jadi Java-less! ☕",
    "Debugging: Being the detective in a crime movie where you are also the murderer.",
    "There are two hard things in computer science: cache invalidation, naming things, and off-by-one errors.",
    "Programmer yang baik itu kayak vampir: takut sama garlic dan cross... eh salah, takut sama deadline dan meeting!",
    "Why did the developer go broke? Because he used up all his cache! 💰",
    "Kenapa developer ga pernah lapar? Karena mereka selalu ada cookies! 🍪",
    "Hidup itu kayak coding: kalo ada bug, tinggal restart aja. Kalo masih error, blame it on the browser!",
    "Why did the programmer quit his job? He didn't get arrays! (a raise)",
    "Software is like entropy: It always increases until someone fixes it.",
    "Programmer adalah satu-satunya profesi yang bisa bikin masalah dari yang ga ada masalah."
];
// Motivational quotes buat developer
export const DEV_MOTIVATION = [
    "Code with passion, debug with patience",
    "Every expert was once a beginner",
    "The best way to learn is by doing (and breaking things)",
    "Embrace the bugs, they teach you patience",
    "Good code is its own best documentation",
    "Simplicity is the ultimate sophistication",
    "Make it work, make it right, make it fast",
    "Ga ada code yang perfect, yang ada code yang working"
];
// Indonesian developer slang
export const DEV_SLANG = [
    "Gw lagi debug nih, jangan ganggu dulu",
    "Code-nya masih berantakan, bentar lagi rapih",
    "Ini bug-nya aneh banget, ga masuk akal",
    "Production error lagi, siap-siap begadang",
    "Meeting mulu kapan ngoding-nya",
    "Dokumentasi? Apaan tuh? Code is the documentation",
    "Testing di production, YOLO!",
    "Refactor nanti aja, yang penting jalan dulu"
];
// ASCII Art buat banner - personal touch
export const ASCII_BANNERS = [
    `
  ╔═══╗╔═══╗╔╗ ╔╗╔═══╗╔═══╗╔═══╗  
  ║╔═╗║║╔══╝║║ ║║╚╗╔╗║║╔══╝║╔═╗║  
  ║║ ║║║╚══╗║╚═╝║ ║║║║║╚══╗║╚═╝║  
  ║║ ║║║╔══╝║╔═╗║ ║║║║║╔══╝║╔╗╔╝  
  ║╚═╝║║╚══╗║║ ║║╔╝╚╝║║╚══╗║║║╚╗  
  ╚═══╝╚═══╝╚╝ ╚╝╚═══╝╚═══╝╚╝╚═╝  
  `,
    `
  ┌─┐┌─┐┌┬┐┌─┐  ┬ ┬┬┌┬┐┬ ┬  ┌─┐┌─┐┌─┐┌─┐┬┌─┐┌┐┌
  │  │ │ ││├┤   ││││ │ ├─┤  ├─┘├─┤└─┐└─┐││ ││││
  └─┘└─┘─┴┘└─┘  └┴┘┴ ┴ ┴ ┴  ┴  ┴ ┴└─┘└─┘┴└─┘┘└┘
  `
];
/**
 * Main class buat handle semua jokes dan fun stuff
 * Gw bikin class biar lebih terorganisir (dan keliatan pro)
 */
export class DevJokes {
    // Get random joke - klasik!
    static getRandomJoke() {
        return DEV_JOKES[Math.floor(Math.random() * DEV_JOKES.length)];
    }
    // Get random motivation - buat semangat coding
    static getRandomMotivation() {
        return DEV_MOTIVATION[Math.floor(Math.random() * DEV_MOTIVATION.length)];
    }
    // Get random slang - buat yang suka bahasa gaul
    static getRandomSlang() {
        return DEV_SLANG[Math.floor(Math.random() * DEV_SLANG.length)];
    }
    // Morning motivation - untuk startup message
    static getMorningVibes() {
        const hour = new Date().getHours();
        if (hour < 10) {
            return "☀️ Pagi yang produktif! " + this.getRandomMotivation();
        }
        else if (hour < 17) {
            return "🌤️ Semangat siang! " + this.getRandomJoke();
        }
        else if (hour < 22) {
            return "🌅 Masih semangat coding! " + this.getRandomSlang();
        }
        else {
            return "🌙 Begadang mode on! Coffee loading... ☕";
        }
    }
    // Easter egg detector - personal touch yang gw suka banget
    static detectEasterEgg(input) {
        const easterEggs = {
            'konami': '⬆️⬆️⬇️⬇️⬅️➡️⬅️➡️🅱️🅰️ Achievement unlocked!',
            'coffee': '☕ Code runs on coffee and dreams',
            'bug': '🐛 It\'s not a bug, it\'s an undocumented feature',
            'production': '🔥 This is fine... everything is fine in production',
            'weekend': '📅 There are no weekends in startup life',
            'deploy': '🚀 To infinity and beyond! (And hopefully not crash)',
            'debug': '🔍 console.log("here") - the universal debugger'
        };
        const lowerInput = input.toLowerCase();
        for (const [key, value] of Object.entries(easterEggs)) {
            if (lowerInput.includes(key)) {
                return value;
            }
        }
        return null;
    }
    // Get random ASCII banner - buat yang suka visual
    static getRandomBanner() {
        return ASCII_BANNERS[Math.floor(Math.random() * ASCII_BANNERS.length)];
    }
}
// Export individual functions buat convenience - gaya personal gw
export const getRandomJoke = () => DevJokes.getRandomJoke();
export const getRandomMotivation = () => DevJokes.getRandomMotivation();
export const getMorningVibes = () => DevJokes.getMorningVibes();
export const getRandomSlang = () => DevJokes.getRandomSlang();
export const detectEasterEgg = (input) => DevJokes.detectEasterEgg(input);
export const getRandomBanner = () => DevJokes.getRandomBanner();
//# sourceMappingURL=dev-jokes.js.map