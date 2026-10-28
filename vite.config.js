import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base is './' so the built site works on GitHub Pages under any repo name
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})
