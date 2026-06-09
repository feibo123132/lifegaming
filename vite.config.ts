import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/lifegaming/',
  plugins: [react()],
  server: {
    port: 5173,
    open: '/lifegaming/'
  }
})
