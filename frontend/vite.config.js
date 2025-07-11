import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api/auth': env.VITE_SOCKET_URL,
        '/api/code': env.VITE_SOCKET_URL,
      },
    },
  }
})
