import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  // 取消监视这些文件夹，防止node崩溃
  server: {
    port: 5173,
    watch: {
      ignored: [
        '**/.git/**',
        '**/dist/**',
        '**/node_modules/**',
        '**/src-tauri/target/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
})
