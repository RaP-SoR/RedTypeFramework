import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue' 
import commonjs from "vite-plugin-commonjs";
import { resolve } from 'path'
import fs from 'fs'
import { exec } from 'child_process'
import https from 'https'

// Konfiguration für RedM-Server
const config = {
  // Hier den Pfad zu deinem RedM-Ressourcenordner eintragen
  serverResourcePath: "C:/Users/babar/Desktop/Infinity Core Server/txData/InfinityCore_10C38B.base/resources/[test]/",
  resourceName: "redtype-framework",
  txAdmin: {
    url: "http://localhost:40120",  // URL zu deinem txAdmin Panel
    apiToken: "",  // Optional: Dein API-Token, falls du es verwenden willst
  }
}

// Plugin für txAdmin-Neustart der Ressource
function txAdminResourcePlugin() {
  return {
    name: 'txadmin-resource',
    closeBundle: async () => {
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔄 Ressource wird neu gestartet...')
        try {
          // Warten wir einen Moment, damit die Dateien geschrieben werden können
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Du kannst auch einen einfachen Befehl ausführen, der eine neue CMD-Instanz öffnet
          // und den Befehl dort ausführt, um Probleme mit gleichzeitigen Build-Prozessen zu vermeiden
          exec(`start cmd.exe /C "echo Starte ${config.resourceName} neu... && timeout /t 2 && curl -s -X POST "${config.txAdmin.url}/intercom/3DS1zWEcjMUPA76Z/resources/restart" -H "Content-Type: application/json" -d "{\\"resourceName\\":\\"${config.resourceName}\\"}" && echo Ressource neugestartet!"`, 
            (error, stdout, stderr) => {
              if (error) {
                console.error(`❌ Fehler beim Neustarten: ${error.message}`)
                return
              }
              if (stderr) {
                console.error(`❌ Fehler: ${stderr}`)
                return
              }
            }
          )
          console.log('✅ Neustart-Befehl gesendet!')
        } catch (error) {
          console.error('❌ Fehler beim Neustarten der Ressource:', error)
        }
      }
    }
  }
}

const outputDir = process.env.NODE_ENV !== 'production' 
  ? "dist" 
  : `${config.serverResourcePath}${config.resourceName}/dist/`

console.log(`Output directory: ${outputDir}`)
console.log(`Server resource path: ${config.serverResourcePath}`)
export default defineConfig({
  plugins: [
    vue(),  // Vue-Plugin hinzugefügt, da du es importiert hast
    commonjs(),
    txAdminResourcePlugin()
  ],
  build: {
    target: "node16",
    outDir: outputDir,
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
    watch: process.env.NODE_ENV !== 'production' ? {} : null
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/core/'),
      '@rtf': resolve(__dirname, 'src/rtf/core/')
    }
  }
})