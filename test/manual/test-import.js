// Test CommonJS require
const { CenzeroApp } = require('./dist/index.js');

console.log('✅ CommonJS require successful');
console.log('CenzeroApp constructor:', typeof CenzeroApp);

const app = new CenzeroApp();
console.log('✅ CenzeroApp instance created');

module.exports = { app };
