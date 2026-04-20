import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/quizz/',
  plugins: [vue()],
  server: {
    port: 3000,
    strictPort: true,
  },
  resolve: {
    alias: {
      vue: 'vue/dist/vue.runtime.esm-bundler.js',
    },
  },
})