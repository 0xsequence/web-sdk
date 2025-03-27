// scripts/watch-css.js
import { watch } from 'fs'
import { exec } from 'child_process'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '../../')

const watchDirs = ['connect/src', 'checkout/src', 'wallet-widget/src'].map(dir => join(rootDir, dir))

const processCSS = () => {
  exec(
    'tailwindcss -i ./src/index.css -o - | echo "export const styles = String.raw\\`\\n$(cat)\\`" > ./src/styles.ts',
    { shell: true },
    error => {
      if (error) {
        console.error('Error processing CSS:', error)
      }
    }
  )
}

watchDirs.forEach(dir => {
  watch(dir, { recursive: true }, (eventType, filename) => {
    if (filename && /\.(ts|tsx)$/.test(filename) && !filename.includes('styles.ts')) {
      console.log(`Change detected in ${dir}/${filename}`)
      processCSS()
    }
  })
})

processCSS()
console.log('Watching for changes in TypeScript files...')
