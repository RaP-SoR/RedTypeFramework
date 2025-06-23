import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import commonjs from "vite-plugin-commonjs";
import { resolve } from "path";

// Diese Konfiguration wird nur für UI-Builds verwendet
// Core-Builds verwenden jetzt build-fivem.js
export default defineConfig({
  plugins: [vue(), commonjs()],
  build: {
    target: "node16",
    outDir: "dist/ui",
    emptyOutDir: true,
    minify: false,
    sourcemap: true,
    watch: process.env.NODE_ENV !== "production" ? {} : null
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src/core/"),
      "@ctf": resolve(__dirname, "src/core/"),
      "@shared": resolve(__dirname, "src/core/shared/"),
      "@client": resolve(__dirname, "src/core/client/"),
      "@server": resolve(__dirname, "src/core/server/"),
      "@plugins": resolve(__dirname, "modules/")
    }
  }
});