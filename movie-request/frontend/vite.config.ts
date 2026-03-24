import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: {
        'remoteEntry': 'src/index.ts',
      },
      formats: ['es'],
      fileName: (_, entryName) => `${entryName}.js`,
    },
    outDir: 'dist',
    rollupOptions: {
      external: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query', 'lucide-react'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
})
