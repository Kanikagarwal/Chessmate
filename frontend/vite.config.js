import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss(),],
  server:{
    proxy:{
      '/api/auth':import.meta.env.VITE_SOCKET_URL,
      '/api/code': import.meta.env.VITE_SOCKET_URL,
    }
  }
})
