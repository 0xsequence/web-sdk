module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        esmodules: true
      },
      bugfixes: true,
      loose: true,
      exclude: [
        '@babel/plugin-transform-async-to-generator',
        '@babel/plugin-transform-regenerator'
      ]
    }],
    '@babel/preset-typescript',
    '@babel/preset-react'
  ],
  plugins: [
    ['@babel/plugin-transform-class-properties', { loose: true }],
    ["@vanilla-extract/babel-plugin", {}]
  ]
}
