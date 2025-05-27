import { spawn } from 'child_process';

export function devServer(options: any) {
  console.log('🔥 Starting development server...');
  
  const port = options.port || 3000;
  const host = options.host || 'localhost';
  
  // Start the development server with ts-node as requested
  const child = spawn('npx', ['ts-node', 'src/index.ts'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'development',
      PORT: port,
      HOST: host
    }
  });

  child.on('error', (error) => {
    console.error('❌ Failed to start development server:', error);
    console.error('💡 Make sure ts-node is installed: npm install -g ts-node');
    process.exit(1);
  });

  child.on('close', (code) => {
    if (code !== 0) {
      console.error(`❌ Development server exited with code ${code}`);
      process.exit(code);
    }
  });

  process.on('SIGINT', () => {
    console.log('\\n🛑 Stopping development server...');
    child.kill('SIGINT');
    process.exit(0);
  });
}
