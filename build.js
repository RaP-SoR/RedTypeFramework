const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function buildTypeScript() {
  try {
    console.log('Building TypeScript files for FiveM...');
    
    // Clean dist directory
    const distDir = path.join(__dirname, 'dist');
    if (fs.existsSync(distDir)) {
      fs.rmSync(distDir, { recursive: true });
    }
    
    // Compile TypeScript
    execSync('npx tsc --project tsconfig.json --outDir dist --module commonjs --target es2020 --moduleResolution node --esModuleInterop true --allowSyntheticDefaultImports true --strict false', {
      stdio: 'inherit',
      cwd: __dirname
    });
    
    console.log('TypeScript compilation completed.');
    
    // Post-process all files
    processCompiledFiles();
    
    console.log('Build completed successfully!');
    
  } catch (error) {
    console.error('Build failed:', error.message);
    process.exit(1);
  }
}

function processCompiledFiles() {
  console.log('Post-processing files for FiveM compatibility...');
  
  const distDir = path.join(__dirname, 'dist');
  
  function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        processDirectory(filePath);
      } else if (file.endsWith('.js')) {
        processJSFile(filePath);
      }
    }
  }
  
  if (fs.existsSync(distDir)) {
    processDirectory(distDir);
  }
}

function processJSFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Simple and safe transformation for FiveM
  content = safeFiveMTransform(content);
  
  fs.writeFileSync(filePath, content);
  console.log(`Processed: ${path.relative(__dirname, filePath)}`);
}

function safeFiveMTransform(content) {
  let result = content;
  
  // Remove "use strict" and add our header
  result = result.replace(/"use strict";\s*/g, '');
  result = 'if (!globalThis.CTF) globalThis.CTF = {};\n"use strict";\n\n' + result;
  
  // Remove CommonJS artifacts completely
  result = result.replace(/Object\.defineProperty\(exports,[\s\S]*?\}\);?/g, '');
  
  // Handle exports.VARIABLE = {...} patterns specially
  result = result.replace(/^exports\.(\w+)\s*=\s*(\{[\s\S]*?\});?$/gm, (match, varName, objContent) => {
    return `const ${varName} = ${objContent};`;
  });
  
  // Remove other exports
  result = result.replace(/^exports\.\w+\s*=.*$/gm, '');
  result = result.replace(/^exports\s*=.*$/gm, '');
  
  // Replace require statements with empty objects
  result = result.replace(/const\s+\w+\s*=\s*require\([^)]+\);?/g, '');
  result = result.replace(/require\([^)]+\)/g, '{}');
  
  // Fix TypeScript module references  
  result = result.replace(/(\w+_\d+)\.(\w+)/g, '(globalThis.CTF?.$2 || $2)');
  result = result.replace(/\(0,\s*(\w+_\d+)\.(\w+)\)/g, '(0, (globalThis.CTF?.$2 || $2))');
  
  // Find all top-level symbols and create a simple protection wrapper
  const symbols = new Set();
  
  // Find classes
  const classMatches = result.match(/^class\s+(\w+)/gm) || [];
  classMatches.forEach(match => {
    const className = match.replace(/^class\s+/, '');
    symbols.add(className);
  });
  
  // Find functions
  const functionMatches = result.match(/^function\s+(\w+)/gm) || [];
  functionMatches.forEach(match => {
    const funcName = match.replace(/^function\s+/, '');
    symbols.add(funcName);
  });
  
  // Find constants
  const constMatches = result.match(/^const\s+(\w+)\s*=/gm) || [];
  constMatches.forEach(match => {
    const constName = match.replace(/^const\s+(\w+)\s*=.*/, '$1');
    if (!constName.includes('CTF') && constName !== 'globalThis') {
      symbols.add(constName);
    }
  });
  
  // Simple approach: wrap the entire content in existence checks, then register symbols
  if (symbols.size > 0) {
    const symbolNames = Array.from(symbols);
    const existenceChecks = symbolNames.map(name => `typeof ${name} === 'undefined'`).join(' && ');
    
    // Wrap content
    result = `if (${existenceChecks}) {\n\n${result}\n\n// Register symbols in CTF namespace\n`;
    symbolNames.forEach(symbol => {
      result += `globalThis.CTF.${symbol} = ${symbol};\n`;
    });
    result += '\n}';
  }
  
  return result;
}

// Start the build
buildTypeScript();
