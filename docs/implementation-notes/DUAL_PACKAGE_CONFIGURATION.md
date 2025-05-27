# 📦 Dual Package Configuration - ESM & CommonJS

Konfigurasi build TypeScript untuk menghasilkan format **ESM (ECMAScript Modules)** dan **CommonJS** secara bersamaan.

## 🏗️ **Struktur Output**

```
dist/
├── cjs/                   # CommonJS build
│   ├── core/
│   ├── middleware/
│   ├── plugins/
│   ├── cli/
│   └── index.js
└── esm/                   # ESM build
    ├── core/
    ├── middleware/
    ├── plugins/
    ├── cli/
    ├── index.js
    └── package.json       # { "type": "module" }
```

## ⚙️ **Konfigurasi TypeScript**

### 1. `tsconfig.cjs.json` - CommonJS Build
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2020",
    "outDir": "./dist/cjs",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

### 2. `tsconfig.esm.json` - ESM Build
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "ES2020",
    "target": "ES2020",
    "outDir": "./dist/esm",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

## 📄 **Package.json Configuration**

### Main Fields
```json
{
  "main": "dist/cjs/index.js",
  "module": "dist/esm/index.js",
  "types": "dist/cjs/index.d.ts"
}
```

### Exports Field (Conditional Exports)
```json
{
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
      "import": {
        "types": "./dist/esm/core/index.d.ts",
        "default": "./dist/esm/core/index.js"
      },
      "require": {
        "types": "./dist/cjs/core/index.d.ts",
        "default": "./dist/cjs/core/index.js"
      }
    },
    "./middleware": {
      "import": {
        "types": "./dist/esm/middleware/index.d.ts",
        "default": "./dist/esm/middleware/index.js"
      },
      "require": {
        "types": "./dist/cjs/middleware/index.d.ts",
        "default": "./dist/cjs/middleware/index.js"
      }
    },
    "./plugins": {
      "import": {
        "types": "./dist/esm/plugins/index.d.ts",
        "default": "./dist/esm/plugins/index.js"
      },
      "require": {
        "types": "./dist/cjs/plugins/index.d.ts",
        "default": "./dist/cjs/plugins/index.js"
      }
    }
  }
}
```

### Build Scripts
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

## 🔧 **ESM Fix Script (`scripts/fix-esm.js`)**

Script otomatis untuk:
- ✅ Menambahkan ekstensi `.js` pada import relatif
- ✅ Mengatasi import directory → `index.js`
- ✅ Membuat `package.json` dengan `"type": "module"` di folder ESM
- ✅ Memproses semua file `.js` secara rekursif

## 📝 **Usage Examples**

### CommonJS (Node.js default)
```javascript
// Main package
const { CenzeroApp } = require('cnzr');

// Submodules
const { corsMiddleware } = require('cnzr/middleware');
const { CenzeroContext } = require('cnzr/core');
```

### ESM (Modern JavaScript)
```javascript
// Main package
import { CenzeroApp } from 'cnzr';

// Submodules
import { corsMiddleware } from 'cnzr/middleware';
import { CenzeroContext } from 'cnzr/core';
```

### TypeScript
```typescript
// Main package
import { CenzeroApp, type Context } from 'cnzr';

// Submodules
import { corsMiddleware } from 'cnzr/middleware';
import { CenzeroContext } from 'cnzr/core';
```

## ✅ **Testing Build Results**

```bash
# Test CommonJS
node -e "const { CenzeroApp } = require('./dist/cjs'); console.log('✅ CJS:', typeof CenzeroApp);"

# Test ESM
node --input-type=module -e "import { CenzeroApp } from './dist/esm/index.js'; console.log('✅ ESM:', typeof CenzeroApp);"

# Test submodules
node -e "const { corsMiddleware } = require('./dist/cjs/middleware'); console.log('✅ CJS middleware:', typeof corsMiddleware);"

node --input-type=module -e "import { corsMiddleware } from './dist/esm/middleware/index.js'; console.log('✅ ESM middleware:', typeof corsMiddleware);"
```

## 🎯 **Benefits**

### ✅ **Universal Compatibility**
- **Node.js CommonJS**: Kompatibel dengan ekosistem Node.js yang ada
- **Modern ESM**: Mendukung bundler modern (Vite, Webpack 5, Rollup)
- **TypeScript**: Type definitions untuk kedua format

### ✅ **Tree Shaking**
- ESM build mendukung tree shaking untuk optimasi bundle size
- Submodule exports untuk import granular

### ✅ **Developer Experience**
- IDE support dengan type definitions
- Auto-completion untuk semua exports
- Consistent API across formats

### ✅ **Future-Proof**
- ESM adalah standar JavaScript masa depan
- CommonJS tetap supported untuk backward compatibility
- Conditional exports menggunakan fitur Node.js modern

## 🏃‍♂️ **Commands**

```bash
# Build semua format
npm run build

# Build CommonJS saja
npm run build:cjs

# Build ESM saja
npm run build:esm

# Clean build artifacts
npm run clean
```

---

**✨ Konfigurasi ini memberikan support penuh untuk kedua format module system dengan tooling modern dan developer experience terbaik!**
