import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    plugins: [
      react(),
      viteStaticCopy({
        targets: [{ src: resolve(__dirname, 'resources/*'), dest: 'resources' }]
      })
    ],
    resolve: {
      alias: {
        '@resources': resolve(__dirname, 'resources')
      }
    }
  }
})
