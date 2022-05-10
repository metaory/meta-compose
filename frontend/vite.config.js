import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import ViteRadar from 'vite-plugin-radar'

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: "http://backend",
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
  }),
  ViteRadar({
    gtm: [{ id: 'GTM-N2TN795', }],
  })
  ]
})
