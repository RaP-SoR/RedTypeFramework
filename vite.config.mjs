import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue' 
import commonjs from "vite-plugin-commonjs";
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(), 
    commonjs()
  ],
  build: {
    target: "node16",
    outDir: 'dist',
    emptyOutDir: true,
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
        entryFileNames: (chunkInfo) => {
          const name = chunkInfo.name.split('/').pop();
          return `core/${chunkInfo.name.includes('shared') ? 'shared' : 
                           chunkInfo.name.includes('client') ? 'client' : 
                           chunkInfo.name.includes('server') ? 'server' : ''}/${name}.js`;
        },
        chunkFileNames: (chunkInfo) => {
          if (chunkInfo.name.includes('shared')) {
            return 'core/shared/[name].js';
          } else if (chunkInfo.name.includes('client')) {
            return 'core/client/[name].js';
          } else if (chunkInfo.name.includes('server')) {
            return 'core/server/[name].js';
          }
          return '[name].js';
        },
        manualChunks: undefined
      },
    },
    watch: process.env.NODE_ENV !== 'production' ? {} : null
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/core/'),
      '@rtf': resolve(__dirname, 'src/core/'),
      '@plugins': resolve(__dirname, 'modules/'),
    }
  }
})