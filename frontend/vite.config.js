import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // --- TAMBAHKAN BLOK INI ---
  server: {
    proxy: {
      // Ini akan mengoper semua request yang dimulai dengan '/api'
      // ke backend server kamu di port 4000
      '/api': 'http://localhost:4000'
    }
  }
  // -------------------------
})