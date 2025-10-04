import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true
  },
  resolve: {
    alias: [
      { find: '@/agents', replacement: path.resolve(__dirname, 'components/agents') },
      { find: '@/hooks', replacement: path.resolve(__dirname, 'components/hooks') },
      { find: '@/utils', replacement: path.resolve(__dirname, 'components/utils') },
      { find: '@', replacement: path.resolve(__dirname) },
    ],
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json']
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
}) 