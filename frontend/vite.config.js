import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: "http://backend",
        // pathRewrite: { "^/api": "" }
        // pathRewrite: { "/api/*": "/" }
        secure: false,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),

      },
    }
  },
  plugins: [vue({
    template: { transformAssetUrls }
  }),
  quasar({
    sassVariables: 'src/theme.sass'
  })]
})
