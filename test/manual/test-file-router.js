"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./src/core/server");
const file_router_1 = require("./src/core/file-router");
console.log('🧪 Testing FileRouter integration...\n');
// Create a CenzeroApp instance for testing
const app = new server_1.CenzeroApp({
    useContext: true,
    useFileRouting: false // We'll manually create the FileRouter
});
// Create FileRouter instance
const router = new file_router_1.FileRouter(app, './routes');
async function testFileRouter() {
    try {
        // Scan and register routes
        await router.scanAndRegister();
        // Get registered routes
        const routes = router.getRoutes();
        console.log('📁 Discovered and registered routes:');
        routes.forEach(route => {
            console.log(`   ${route.method.padEnd(6)} ${route.pattern.padEnd(20)} → ${route.filePath}`);
        });
        console.log(`\n✅ Total routes registered: ${routes.length}`);
        // Test route patterns
        console.log('\n🔧 Route pattern examples:');
        const examples = [
            { file: 'index.ts', pattern: '/' },
            { file: 'about.ts', pattern: '/about' },
            { file: 'api/hello.ts', pattern: '/api/hello' },
            { file: 'api/users/[id].ts', pattern: '/api/users/:id' },
            { file: 'blog/[...slug].ts', pattern: '/blog/*slug' }
        ];
        examples.forEach(example => {
            console.log(`   ${example.file.padEnd(25)} → ${example.pattern}`);
        });
        console.log('\n🎉 File router test completed successfully!');
    }
    catch (error) {
        console.error('❌ Test failed:', error);
    }
}
testFileRouter();
