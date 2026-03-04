/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: config => {
    config.externals.push('pino-pretty', 'encoding')
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@base-org/account': false,
      '@gemini-wallet/core': false,
      '@react-native-async-storage/async-storage': false,
      '@safe-global/safe-apps-provider': false,
      '@safe-global/safe-apps-sdk': false,
      porto: false,
      'porto/internal': false
    }
    return config
  }
}

export default nextConfig
