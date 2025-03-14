import { defineConfig } from 'vite'
import dns from 'dns'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import viteTsconfigPaths from 'vite-tsconfig-paths'
import svgrPlugin from 'vite-plugin-svgr'

dns.setDefaultResultOrder('verbatim')

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      nodePolyfills({
        include: ['buffer'],
        globals: {
          Buffer: true
        }
      }),
      viteTsconfigPaths(),
      svgrPlugin()
    ],
    define: {
      __WEB_SDK_PACKAGE_VERSION__: JSON.stringify(process.env.npm_package_version),
      __WEB_SDK_DEV_GLOBAL__: JSON.stringify(process.env.DEV_GLOBAL || false),
      __WEB_SDK_DEV_SARDINE__: JSON.stringify(process.env.DEV_SARDINE || false),
      __WEB_SDK_DEV_TRANSAK__: JSON.stringify(process.env.DEV_TRANSAK || false),
      __WEB_SDK_DEV_SEQUENCE_APIS__: JSON.stringify(process.env.DEV_SEQUENCE_APIS || false),
      __WEB_SDK_DEV_SARDINE_PROJECT_ACCESS_KEY__: JSON.stringify(process.env.DEV_SARDINE_PROJECT_ACCESS_KEY || '')
    },
    resolve: {
      dedupe: ['wagmi', 'viem']
    },
    build: {
      minify: false
    },
    server: {
      minify: false,
      port: 4444,
      fs: {
        // Allow serving files from one level up to the project root
        allow: ['..']
      }
    },
    base: ''
  }
})
