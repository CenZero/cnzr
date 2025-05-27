// Test ESM import
import { CenzeroApp } from './dist/index.mjs';

console.log('✅ ESM import successful');
console.log('CenzeroApp constructor:', typeof CenzeroApp);

const app = new CenzeroApp();
console.log('✅ CenzeroApp instance created');

export { app };
