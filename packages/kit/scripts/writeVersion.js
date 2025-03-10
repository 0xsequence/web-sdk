const fs = require('fs')
const path = require('path')

const packageJsonPath = path.resolve(__dirname, '../package.json')
const versionFilePath = path.resolve(__dirname, '../src/constants/version.ts')

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
const version = packageJson.version

const versionContent = `export const WEB_SDK_VERSION = '${version}';\n`
fs.writeFileSync(versionFilePath, versionContent, 'utf-8')
