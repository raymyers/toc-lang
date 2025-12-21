/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import eslint from 'vite-plugin-eslint2'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), eslint()],
  base: '/toc-lang/',
  assetsInclude: ['**/*.peggy'],
  server: {
    host: '0.0.0.0',
    port: 12000,
    cors: true,
    headers: {
      'X-Frame-Options': 'ALLOWALL'
    }
  },
  test: {
  }
})
