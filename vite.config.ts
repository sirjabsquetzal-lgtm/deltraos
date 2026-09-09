import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// Served from https://sirjabsquetzal-lgtm.github.io/deltraos/ via GitHub Pages,
// so every built asset needs the repo name as its base path.
export default defineConfig({
  base: '/deltraos/',
  plugins: [react()],
})
