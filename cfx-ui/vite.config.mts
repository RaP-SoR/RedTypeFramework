import Components from "unplugin-vue-components/vite";
import Vue from "@vitejs/plugin-vue";
import Vuetify, { transformAssetUrls } from "vite-plugin-vuetify";
import ViteFonts from "unplugin-fonts/vite";

import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  base: "/", // Für FiveM richtig setzen
  plugins: [
    Vue({
      template: { transformAssetUrls },
    }),
    Vuetify(),
    Components(),

    ViteFonts({
      google: {
        families: [
          {
            name: "Roboto",
            styles: "wght@100;300;400;500;700;900",
          },
        ],
      },
    }),
  ],
  define: { "process.env": {} },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@components": fileURLToPath(
        new URL("./src/components", import.meta.url)
      ),
      "@views": fileURLToPath(new URL("./src/views", import.meta.url)),
      "@stores": fileURLToPath(new URL("./src/stores", import.meta.url)),
      "@utils": fileURLToPath(new URL("./src/utils", import.meta.url)),
      "@assets": fileURLToPath(new URL("./src/assets", import.meta.url)),
    },
    extensions: [".js", ".json", ".jsx", ".mjs", ".ts", ".tsx", ".vue"],
  },
  server: {
    port: 3000,
  }, // Build-Konfiguration für RedM Integration
  build: {
    outDir: "../dist/ui", // Ausgabe im RedM-Resource-Ordner
    emptyOutDir: true, // Leert den Ausgabeordner vor dem Build
    sourcemap: false, // Für Produktion deaktivieren
    minify: true, // Dateigröße reduzieren
    // CSS-Einstellungen
    cssCodeSplit: true,
    // Target für moderne Browser
    target: "esnext",
    rollupOptions: {
      output: {
        // KEINE Hashes für FiveM/RedM - vereinfacht Pfad-Management
        assetFileNames: "assets/[name][extname]",
        chunkFileNames: "assets/[name].js",
        entryFileNames: "assets/[name].js",
        // Größere Chunks vermeiden
        manualChunks: {
          vue: ["vue", "vue-router", "pinia"],
          vuetify: ["vuetify"],
        },
      },
    },
  },
});
