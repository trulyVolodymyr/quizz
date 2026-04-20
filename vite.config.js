import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/quizz/',
  plugins: [vue()],
  resolve: {
    alias: {
      vue: 'vue/dist/vue.runtime.esm-bundler.js',
    },
  },
})