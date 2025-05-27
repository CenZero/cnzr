# 📦 Dual Package Configuration - ESM & CommonJS

Konfigurasi ini menghasilkan dua format build yang kompatibel dengan berbagai lingkungan Node.js dan bundler.

## 🏗️ **Struktur Output**

```
dist/
├── cjs/                  # CommonJS build
│   ├── index.js
│   ├── index.d.ts
│   ├── core/
│   ├── middleware/
│   ├── plugins/
│   └── cli/
└── esm/                  # ESM build  
    ├── package.json      # { "type": "module" }
    ├── index.js
    ├── index.d.ts
    ├── core/
    ├── middleware/
    ├── plugins/
    └── cli/
```

## ⚙️ **Konfigurasi TypeScript**

### 1. **CommonJS Build** (`tsconfig.cjs.json`)
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2020", 
    "outDir": "./dist/cjs",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

### 2. **ESM Build** (`tsconfig.esm.json`)
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "ES2020",
    "target": "ES2020",
    "outDir": "./dist/esm", 
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

## 📝 **Package.json Exports**

```json
{
  "main": "dist/cjs/index.js",
  "module": "dist/esm/index.js", 
  "types": "dist/cjs/index.d.ts",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/esm/index.d.ts",
        "default": "./dist/esm/index.js"
      },
      "require": {
        "types": "./dist/cjs/index.d.ts", 
        "default": "./dist/cjs/index.js"
      }
    },
    "./core": {
      "import": "./dist/esm/core/index.js",
      "require": "./dist/cjs/core/index.js"
    },
    "./middleware": {
      "import": "./dist/esm/middleware/index.js", 
      "require": "./dist/cjs/middleware/index.js"
    },
    "./plugins": {
      "import": "./dist/esm/plugins/index.js",
      "require": "./dist/cjs/plugins/index.js"
    }
  }
}
```

## 🚀 **Script Build**

```json
{
  "scripts": {
    "build": "npm run clean && npm run build:cjs && npm run build:esm",
    "build:cjs": "tsc -p tsconfig.cjs.json",
    "build:esm": "tsc -p tsconfig.esm.json && npm run fix-esm",
    "fix-esm": "node scripts/fix-esm.js",
    "clean": "rm -rf dist"
  }
}
```

## 🔧 **ESM Post-Processing**

Script `scripts/fix-esm.js` melakukan:

1. **Fix Import Extensions**: Menambahkan `.js` extension ke relative imports
2. **Add Package.json**: Menambahkan `{"type": "module"}` ke `dist/esm/`
3. **Path Resolution**: Memastikan semua imports menggunakan ekstensi yang benar

## 📊 **Kompatibilitas**

### ✅ **CommonJS (CJS)**
- Node.js versi lama
- Require syntax: `require('cnzr')`
- Bundler yang tidak mendukung ESM

### ✅ **ES Modules (ESM)**  
- Node.js modern (14+)
- Import syntax: `import { CenzeroApp } from 'cnzr'`
- Modern bundler (Vite, Webpack 5, Rollup)

## 🎯 **Penggunaan**

### **CommonJS**
```javascript
const { CenzeroApp } = require('cnzr');
const app = new CenzeroApp();
```

### **ES Modules**
```javascript
import { CenzeroApp } from 'cnzr';
const app = new CenzeroApp();
```

### **Submodule Imports**
```javascript
// CommonJS
const { cors } = require('cnzr/middleware');

// ESM  
import { cors } from 'cnzr/middleware';
```

## 🏷️ **Keuntungan**

✅ **Universal Compatibility** - Mendukung semua lingkungan Node.js  
✅ **Tree Shaking** - ESM build mendukung tree shaking optimal  
✅ **Type Safety** - Declaration files untuk kedua format  
✅ **Modern Tooling** - Kompatibel dengan bundler modern  
✅ **Legacy Support** - Tetap mendukung CommonJS  

## 📦 **Build Commands**

```bash
# Build semua format
npm run build

# Build hanya CommonJS
npm run build:cjs

# Build hanya ESM
npm run build:esm

# Clean build artifacts
npm run clean
```

## 🧪 **Testing Build**

```bash
# Test CommonJS
node -e "const { CenzeroApp } = require('./dist/cjs'); console.log(CenzeroApp);"

# Test ESM  
node --input-type=module -e "import { CenzeroApp } from './dist/esm/index.js'; console.log(CenzeroApp);"
```

---

Konfigurasi ini memastikan bahwa Cenzero Framework dapat digunakan di berbagai lingkungan pengembangan modern maupun legacy dengan optimal.
