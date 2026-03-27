import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['iife'],
      name: '__acp_plugin_init',
      fileName: () => 'remoteEntry.js',
    },
    outDir: 'dist',
    // No externals — bundle all dependencies so the plugin is self-contained.
    // Browser native ES modules can't resolve bare specifiers like 'react'.
  },
})
