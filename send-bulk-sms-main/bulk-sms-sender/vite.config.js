import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/send-bulk-sms/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/3rdparty': {
        target: 'https://api.sms-gate.app',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
