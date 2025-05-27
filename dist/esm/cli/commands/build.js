import { spawn } from 'child_process';
export function buildProject(options) {
    console.log('🏗️  Building project for production...');
    const outputDir = options.output || 'dist';
    // Run TypeScript compiler as requested
    const child = spawn('npx', ['tsc'], {
        stdio: 'inherit'
    });
    child.on('close', (code) => {
        if (code === 0) {
            console.log('✅ Build completed successfully!');
            console.log(`📦 Output directory: ${outputDir}`);
            console.log('\\nTo run in production:');
            console.log(`  node ${outputDir}/index.js`);
        }
        else {
            console.error('❌ Build failed!');
            console.error('💡 Make sure TypeScript is installed: npm install -g typescript');
            process.exit(1);
        }
    });
    child.on('error', (error) => {
        console.error('❌ Build error:', error);
        console.error('💡 Make sure TypeScript is installed: npm install -g typescript');
        process.exit(1);
    });
}
//# sourceMappingURL=build.js.map