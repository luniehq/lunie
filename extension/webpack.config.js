const webpack = require('webpack')
const ejs = require('ejs')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ExtensionReloader = require('webpack-extension-reloader')
const { VueLoaderPlugin } = require('vue-loader')
const { version } = require('./package.json')
const path = require('path')

function resolve(dir) {
  return path.join(__dirname, dir)
}

const config = {
  devtool: 'inline-cheap-source-map',
  mode: process.env.NODE_ENV,
  context: resolve('src'),
  entry: {
    background: './background.js',
    contentScript: './contentScript.js',
    'popup/popup': './popup/popup.js',
    'popup/sandbox': './popup/sandbox.js'
  },
  output: {
    path: resolve('dist'),
    filename: '[name].js',
    publicPath: '/'
  },
  resolve: {
    alias: {
      assets: resolve('../app/src/assets'),
      '~assets': resolve('../app/src/assets'),
      'common/Avatar': resolve('./src/components/BlankAvatar'),
      common: resolve('../app/src/components/common'),
      account: resolve('../app/src/components/account'),
      network: resolve('../app/src/components/network'),
      transactions: resolve('../app/src/components/transactions'),
      session: resolve('../app/src/components/session'),
      modules: resolve('../app/src/vuex/modules'),
      config: resolve('config.js'),
      src: resolve('../app/src'),
      lunie: resolve('../app'),
      app: resolve('../app'),
      scripts: resolve('../app/src/scripts'),
      '/img/tutorials': resolve('../app/public/img/tutorials'),
      '/img/currencies': resolve('../app/public/img/icons/currencies')
    },
    extensions: ['.js', '.vue', '.css']
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loaders: 'vue-loader'
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
      },
      {
        test: /\.sass$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader?indentedSyntax'
        ]
      },
      {
        test: /\.(png|jpg|gif|svg|ico)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              esModule: false
            }
          }
        ]
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        use: [
          {
            loader: `file-loader`,
            query: {
              name: `fonts/[name].[ext]`
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      global: 'window',
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        SENTRY_DSN: JSON.stringify(process.env.SENTRY_DSN),
        GOOGLE_ANALYTICS_UID: JSON.stringify(process.env.GOOGLE_ANALYTICS_UID),
        LUNIE_API: JSON.stringify(process.env.LUNIE_API),
        EXTENSION: 'true'
      }
    }),
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css'
    }),
    new CopyWebpackPlugin([
      { from: 'icons', to: 'icons', ignore: ['icon.xcf'] },
      { from: 'images/networks', to: 'popup/images/networks' },
      {
        from: 'popup/popup.html',
        to: 'popup/popup.html',
        transform: transformHtml
      },
      {
        from: 'popup/sandbox.html',
        to: 'popup/sandbox.html',
        transform: transformHtml
      },
      {
        from: 'popup/validator-icon.svg',
        to: 'popup/validator-icon.svg'
      },
      {
        from: 'manifest.json',
        to: 'manifest.json',
        transform: (content) => {
          const jsonContent = JSON.parse(content)
          jsonContent.version = version

          if (config.mode === 'development') {
            jsonContent['content_security_policy'] =
              "script-src 'self' 'unsafe-eval' https://www.google-analytics.com/analytics.js; object-src 'self'"
          }

          return JSON.stringify(jsonContent, null, 2)
        }
      }
    ])
  ]
}

if (config.mode === 'production') {
  config.plugins = (config.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    })
  ])
}

if (process.env.HMR === 'true') {
  config.plugins = (config.plugins || []).concat([
    new ExtensionReloader({
      manifest: resolve('src/manifest.json')
    })
  ])
}

function transformHtml(content) {
  return ejs.render(content.toString(), {
    ...process.env
  })
}

module.exports = config
