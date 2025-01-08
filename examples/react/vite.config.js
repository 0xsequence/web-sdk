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
      'process.env.PACKAGE_VERSION': JSON.stringify(process.env.npm_package_version),
      'process.env.DEBUG': JSON.stringify(process.env.DEBUG || false)
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
