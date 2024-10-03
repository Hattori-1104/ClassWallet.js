import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: true
  },
  css: {
    preprocessorOptions: {
      scss: { api: "modern-compiler" },
      sass: { api: "modern-compiler" },
    },
  },
})
