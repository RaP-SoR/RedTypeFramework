import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue' 
import commonjs from "vite-plugin-commonjs";
import { resolve } from 'path'

export default defineConfig({
  plugins: [commonjs()],
  build: {
    target: "node16",
    outDir: "dist",
    minify: false,
    sourcemap: false,
    ssr: true,
    rollupOptions: {
      input: {
        shared: resolve(__dirname, 'src/core/shared/shared.ts'),
        client: resolve(__dirname, 'src/core/client/client.ts'),
        server: resolve(__dirname, 'src/core/server/server.ts'),
      },
      external: ["crypto", "fs", "path", "os", "util", "stream", "events"],
      output: {
        format: "cjs",
        entryFileNames: "[name].js",
        chunkFileNames: "[name]-[hash].js"
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/core/'),
      '@rtf': resolve(__dirname, 'src/rtf/core/')
    }
  }
})