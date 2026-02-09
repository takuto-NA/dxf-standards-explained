/**
 * Responsibility:
 * - Configure the standalone DXF viewer web app build/dev server.
 */

import { defineConfig } from 'vite'
import path from 'node:path'

const DEV_SERVER_PORT = 5174

export default defineConfig(async () => {
  const { default: vue } = await import('@vitejs/plugin-vue')

  return {
    root: __dirname,
    plugins: [vue()],
    resolve: {
      alias: {
        '@viewer': path.resolve(__dirname, '../../src/viewer')
      }
    },
    server: {
      port: DEV_SERVER_PORT,
      strictPort: true
    },
    build: {
      outDir: path.resolve(__dirname, '../../dist/viewer-web'),
      emptyOutDir: true
    }
  }
})

