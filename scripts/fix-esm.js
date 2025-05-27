const fs = require('fs');
const path = require('path');

// Process the dist/esm directory
const esmDir = path.join(__dirname, '..', 'dist', 'esm');

/**
 * Get all JS files recursively
 */
function getJsFiles(dir) {
  const jsFiles = [];
  
  function scan(currentDir) {
    if (!fs.existsSync(currentDir)) return;
    
    const entries = fs.readdirSync(currentDir);
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scan(fullPath);
      } else if (entry.endsWith('.js')) {
        jsFiles.push(fullPath);
      }
    }
  }
  
  scan(dir);
  return jsFiles;
}

/**
 * Fix import/export extensions in ESM build
 * Convert .js imports to .js extensions for proper ESM support
 */
function fixEsmExtensions(dir) {
  if (!fs.existsSync(dir)) {
    console.warn(`Directory ${dir} does not exist`);
    return;
  }

  const jsFiles = getJsFiles(dir);
  
  jsFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Fix relative imports: add .js extension and handle index imports
    content = content.replace(
      /from\s+['"](\.[^'"]*?)(?<!\.js)['"]/g,
      (match, importPath) => {
        // If already has .js extension, skip
        if (importPath.endsWith('.js')) return match;
        
        // Check if importing a directory (should resolve to index.js)
        const fullPath = path.resolve(path.dirname(filePath), importPath);
        const indexPath = path.join(fullPath, 'index.js');
        const directPath = fullPath + '.js';
        
        // If directory exists with index.js, append /index.js
        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory() && fs.existsSync(indexPath)) {
          return match.replace(importPath, importPath + '/index.js');
        }
        // If direct .js file exists, append .js
        else if (fs.existsSync(directPath)) {
          return match.replace(importPath, importPath + '.js');
        }
        // Default: just append .js
        else {
          return match.replace(importPath, importPath + '.js');
        }
      }
    );
    
    // Fix export from statements
    content = content.replace(
      /export\s+.*?\s+from\s+['"](\.[^'"]*?)(?<!\.js)['"]/g,
      (match, importPath) => {
        if (importPath.endsWith('.js')) return match;
        
        const fullPath = path.resolve(path.dirname(filePath), importPath);
        const indexPath = path.join(fullPath, 'index.js');
        const directPath = fullPath + '.js';
        
        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory() && fs.existsSync(indexPath)) {
          return match.replace(importPath, importPath + '/index.js');
        } else if (fs.existsSync(directPath)) {
          return match.replace(importPath, importPath + '.js');
        } else {
          return match.replace(importPath, importPath + '.js');
        }
      }
    );
    
    // Fix import() calls
    content = content.replace(
      /import\s*\(\s*['"](\.[^'"]*?)(?<!\.js)['"]\s*\)/g,
      (match, importPath) => {
        if (importPath.endsWith('.js')) return match;
        return match.replace(importPath, importPath + '.js');
      }
    );
    
    fs.writeFileSync(filePath, content);
  });
}

/**
 * Add package.json with type: module to ESM directory
 */
function addEsmPackageJson() {
  const packageJsonPath = path.join(esmDir, 'package.json');
  const packageJsonContent = {
    "type": "module"
  };
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJsonContent, null, 2));
}

// Run the fixes
try {
  console.log('🔧 Fixing ESM imports...');
  fixEsmExtensions(esmDir);
  
  console.log('📦 Adding ESM package.json...');
  addEsmPackageJson();
  
  console.log('✅ ESM build completed');
} catch (error) {
  console.error('❌ ESM fix failed:', error);
  process.exit(1);
}
