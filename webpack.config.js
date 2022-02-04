const webpack = require('@nativescript/webpack')
const path = require('path')

module.exports = (env) => {
  webpack.init(env)
  const platform = webpack.Utils.platform.getPlatformName()
  webpack.chainWebpack((config) => {
    if (platform === 'android') {
      const appComponents = [
        '@nativescript/core/ui/frame',
        '@nativescript/core/ui/frame/activity',
        path.resolve(__dirname, 'app/services/ForegroundService.js'),
      ]
      appComponents.map((component) => {
        config.entry('bundle').add(component)
      })
    }
  })
  return webpack.resolveConfig()
}
