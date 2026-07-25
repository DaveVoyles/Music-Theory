/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * GitHub Pages project sites need a non-root base path (e.g. `/Music-Theory/`).
 * Override at build time: `VITE_BASE_PATH=/ npm run build` for local root hosting.
 * Default matches https://davevoyles.github.io/Music-Theory/
 */
const base = process.env.VITE_BASE_PATH ?? '/Music-Theory/'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base,
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
