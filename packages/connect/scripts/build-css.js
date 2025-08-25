import { execSync } from 'child_process'
import { writeFileSync } from 'fs'

try {
  const css = execSync('tailwindcss -i ./src/index.css -o -', { encoding: 'utf8' })
  const stylesContent = `export const styles = String.raw\`\n${css}\``
  writeFileSync('./src/styles.ts', stylesContent)
  console.log('CSS built successfully')
} catch (error) {
  console.error('Error building CSS:', error)
  process.exit(1)
}
