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
    ],
    assetsInclude: ['**/*.png'],
  }
})
