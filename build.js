const esbuild = require("esbuild");
const fs = require("fs");

console.log("🧹 Clean Build - CTF Framework");

// Clean dist
if (fs.existsSync("dist")) {
  fs.rmSync("dist", { recursive: true });
}
fs.mkdirSync("dist");

// Simple build configuration
const config = {
  bundle: true,
  minify: false,
  sourcemap: false,
  keepNames: true,
  target: "es2017",
  external: ["@citizenfx/*"],
};

// Build server
esbuild.buildSync({
  ...config,
  entryPoints: ["src/core/server/server.ts"],
  outfile: "dist/server.js",
  platform: "node",
  format: "cjs",
});

// Build client
esbuild.buildSync({
  ...config,
  entryPoints: ["src/core/client/client.ts"],
  outfile: "dist/client.js",
  platform: "browser",
  format: "iife",
});

console.log("✅ Build completed");
console.log("📁 Files created:");
console.log("   - dist/server.js");
console.log("   - dist/client.js");
