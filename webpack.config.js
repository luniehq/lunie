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
  mode: process.env.NODE_ENV,
  context: resolve('src'),
  entry: {
    background: './background.js',
    contentScript: './contentScript.js',
    'popup/popup': './popup/popup.js'
  },
  output: {
    path: resolve('dist'),
    filename: '[name].js'
  },
  resolve: {
    alias: {
      assets: resolve('lunie/src/assets'),
      common: resolve('lunie/src/components/common'),
      transactions: resolve('lunie/src/components/transactions'),
      modules: resolve('lunie/src/vuex/modules'),
      config: resolve('config.js'),
      src: resolve('lunie/src'),
      scripts: resolve('lunie/src/scripts')
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
        loader: 'file-loader',
        query: {
          name: `/images/[name].[ext]`
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        use: [
          {
            loader: `file-loader`,
            query: {
              name: `/fonts/[name].[ext]`
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
        GOOGLE_ANALYTICS_UID: JSON.stringify(process.env.GOOGLE_ANALYTICS_UID)
      }
    }),
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css'
    }),
    new CopyWebpackPlugin([
      { from: 'icons', to: 'icons', ignore: ['icon.xcf'] },
      {
        from: 'popup/popup.html',
        to: 'popup/popup.html',
        transform: transformHtml
      },
      {
        from: 'manifest.json',
        to: 'manifest.json',
        transform: content => {
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
