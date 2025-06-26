const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

console.log("🧹 Clean Build - CTF Framework mit Module Support");

// Clean dist
if (fs.existsSync("dist")) {
  fs.rmSync("dist", { recursive: true });
}
fs.mkdirSync("dist");

// Helper functions
function getModules() {
  const modulesDir = "modules";
  if (!fs.existsSync(modulesDir)) {
    return [];
  }
  
  return fs.readdirSync(modulesDir)
    .filter(dir => {
      const modulePath = path.join(modulesDir, dir);
      
      // Check if it's a directory
      if (!fs.statSync(modulePath).isDirectory()) {
        return false;
      }
      
      // Check for .ignore file
      const ignoreFile = path.join(modulePath, ".ignore");
      if (fs.existsSync(ignoreFile)) {
        console.log(`🚫 Skipping ignored module: ${dir}`);
        return false;
      }
      
      return true;
    })
    .map(dir => ({
      name: dir,
      path: path.join(modulesDir, dir)
    }));
}

function getModuleEntryPoints(modulePath, type) {
  const entryPoints = [];
  
  // Check for simple structure (server.ts, client.ts, shared.ts)
  const simpleFile = path.join(modulePath, `${type}.ts`);
  if (fs.existsSync(simpleFile)) {
    entryPoints.push(simpleFile);
  }
  
  // Check for complex structure (server/index.ts, client/index.ts, etc.)
  const complexFile = path.join(modulePath, type, "index.ts");
  if (fs.existsSync(complexFile)) {
    entryPoints.push(complexFile);
  }
  
  return entryPoints;
}

function getAllModuleEntryPoints(type) {
  const modules = getModules();
  const allEntryPoints = [];
  
  // Core entry point
  const coreEntry = `src/core/${type}/${type}.ts`;
  if (fs.existsSync(coreEntry)) {
    allEntryPoints.push(coreEntry);
  }
  
  // Module entry points
  modules.forEach(module => {
    const moduleEntryPoints = getModuleEntryPoints(module.path, type);
    allEntryPoints.push(...moduleEntryPoints);
  });
  
  return allEntryPoints;
}

function getModuleUIComponents() {
  const modules = getModules();
  const uiComponents = [];
  
  modules.forEach(module => {
    // Check for UI directory
    const uiDir = path.join(module.path, "ui");
    if (fs.existsSync(uiDir)) {
      // Scan for Vue components
      const scanUIDir = (dir, relativePath = '') => {
        const items = fs.readdirSync(dir);
        items.forEach(item => {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            scanUIDir(fullPath, path.join(relativePath, item));
          } else if (item.endsWith('.vue')) {
            const componentPath = path.join(dir, item);
            const componentName = `${module.name}-${path.basename(item, '.vue').toLowerCase()}`;
            uiComponents.push({
              name: componentName,
              path: componentPath,
              module: module.name,
              relativePath: path.join(relativePath, item)
            });
          }
        });
      };
      
      scanUIDir(uiDir);
    }
  });
  
  return uiComponents;
}

function generateUIComponentsIndex() {
  const uiComponents = getModuleUIComponents();
  
  if (uiComponents.length === 0) {
    return '';
  }
  
  let indexContent = '// Auto-generated module UI components\n';
  indexContent += 'import { markRaw } from "vue";\n\n';
  
  // Import statements
  uiComponents.forEach((component, index) => {
    const importPath = path.relative('cfx-ui/src', component.path).replace(/\\/g, '/');
    // Fix path resolution - use absolute path from cfx-ui perspective
    const absolutePath = path.resolve(component.path);
    const cfxUiPath = path.resolve('cfx-ui/src');
    const relativePath = path.relative(cfxUiPath, absolutePath).replace(/\\/g, '/');
    indexContent += `import ${component.name.replace(/-/g, '')}Component from "${relativePath}";\n`;
  });
  
  indexContent += '\n// Export module components\n';
  indexContent += 'export const moduleComponents = {\n';
  
  uiComponents.forEach(component => {
    indexContent += `  "${component.name}": markRaw(${component.name.replace(/-/g, '')}Component),\n`;
  });
  
  indexContent += '};\n\n';
  indexContent += 'console.log("Loaded module UI components:", Object.keys(moduleComponents));\n';
  
  return indexContent;
}

// Simple build configuration
const config = {
  bundle: true,
  minify: false,
  sourcemap: false,
  keepNames: true,
  target: "es2017",
  external: ["@citizenfx/*"],
};

console.log("🔍 Scanning for modules...");
const modules = getModules();
console.log(`📦 Found ${modules.length} modules:`, modules.map(m => m.name));

// Build server with modules
console.log("🏗️ Building server bundle...");
const serverEntryPoints = getAllModuleEntryPoints("server");
if (serverEntryPoints.length > 0) {
  if (serverEntryPoints.length === 1) {
    // Single entry point - use outfile
    esbuild.buildSync({
      ...config,
      entryPoints: serverEntryPoints,
      outfile: "dist/server.js",
      platform: "node",
      format: "cjs",
    });
  } else {
    // Multiple entry points - create a main entry file
    const mainServerContent = serverEntryPoints
      .map((entry, index) => `import mod${index} from "./${path.relative(".", entry).replace(/\\/g, "/")}";`)
      .join("\n");
    
    fs.writeFileSync("temp_server_main.ts", mainServerContent);
    
    esbuild.buildSync({
      ...config,
      entryPoints: ["temp_server_main.ts"],
      outfile: "dist/server.js",
      platform: "node",
      format: "cjs",
    });
    
    // Clean up temp file
    fs.unlinkSync("temp_server_main.ts");
  }
  console.log(`✅ Server built with ${serverEntryPoints.length} entry points`);
} else {
  console.log("⚠️ No server entry points found");
}

// Build client with modules
console.log("🏗️ Building client bundle...");
const clientEntryPoints = getAllModuleEntryPoints("client");
if (clientEntryPoints.length > 0) {
  if (clientEntryPoints.length === 1) {
    // Single entry point - use outfile
    esbuild.buildSync({
      ...config,
      entryPoints: clientEntryPoints,
      outfile: "dist/client.js",
      platform: "browser",
      format: "iife",
    });
  } else {
    // Multiple entry points - create a main entry file
    const mainClientContent = clientEntryPoints
      .map((entry, index) => `import mod${index} from "./${path.relative(".", entry).replace(/\\/g, "/")}";`)
      .join("\n");
    
    fs.writeFileSync("temp_client_main.ts", mainClientContent);
    
    esbuild.buildSync({
      ...config,
      entryPoints: ["temp_client_main.ts"],
      outfile: "dist/client.js",
      platform: "browser",
      format: "iife",
    });
    
    // Clean up temp file
    fs.unlinkSync("temp_client_main.ts");
  }
  console.log(`✅ Client built with ${clientEntryPoints.length} entry points`);
} else {
  console.log("⚠️ No client entry points found");
}

// Generate UI components index for modules
console.log("🎨 Processing module UI components...");
const uiComponents = getModuleUIComponents();
if (uiComponents.length > 0) {
  console.log(`📦 Found ${uiComponents.length} UI components:`, uiComponents.map(c => c.name));
  
  // Create module views directory in cfx-ui
  const moduleViewsDir = "cfx-ui/src/views/modules";
  if (!fs.existsSync(moduleViewsDir)) {
    fs.mkdirSync(moduleViewsDir, { recursive: true });
  }
  
  // Copy UI components to accessible location and generate index
  let indexContent = '// Auto-generated module UI components\n';
  indexContent += 'import { markRaw } from "vue";\n\n';
  
  uiComponents.forEach((component) => {
    // Copy component to cfx-ui/src/views/modules/
    const targetPath = path.join(moduleViewsDir, `${component.name}.vue`);
    fs.copyFileSync(component.path, targetPath);
    
    // Add import
    indexContent += `import ${component.name.replace(/-/g, '')}Component from "./views/modules/${component.name}.vue";\n`;
  });
  
  indexContent += '\n// Export module components\n';
  indexContent += 'export const moduleComponents = {\n';
  
  uiComponents.forEach(component => {
    indexContent += `  "${component.name}": markRaw(${component.name.replace(/-/g, '')}Component),\n`;
  });
  
  indexContent += '};\n\n';
  indexContent += 'console.log("Loaded module UI components:", Object.keys(moduleComponents));\n';
  
  // Write index file
  const uiIndexPath = "cfx-ui/src/moduleComponents.ts";
  fs.writeFileSync(uiIndexPath, indexContent);
  console.log(`✅ Generated module UI index: ${uiIndexPath}`);
  console.log(`✅ Copied ${uiComponents.length} components to ${moduleViewsDir}`);
} else {
  console.log("ℹ️ No module UI components found");
  
  // Create empty index file to prevent import errors
  const uiIndexPath = "cfx-ui/src/moduleComponents.ts";
  const emptyContent = '// No module UI components found\nexport const moduleComponents = {};\n';
  
  const uiDir = path.dirname(uiIndexPath);
  if (!fs.existsSync(uiDir)) {
    fs.mkdirSync(uiDir, { recursive: true });
  }
  
  fs.writeFileSync(uiIndexPath, emptyContent);
}

console.log("✅ Build completed");
console.log("📁 Files created:");
console.log("   - dist/server.js");
console.log("   - dist/client.js");
