var path = require('path')
var utils = require('./utils')
var config = require('../config')
var vueLoaderConfig = require('./vue-loader.conf')

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

var markdown = require('markdown-it')({
  // markdown-it config
  preset: 'default',
  html: true,
  typographer: true,
  linkify: true,
  preprocess: function(markdownIt, source) {
    return source
  }
})

markdown.use(require('markdown-it-anchor'))
markdown.use(require('markdown-it-table-of-contents'), {
  includeLevel: [2, 3, 4, 5],
  containerClass: 'minimal-toc'
})

module.exports = {
  entry: {
    app: './src/main.js'
  },
  output: {
    path: config.build.assetsRoot,
    filename: '[name].js',
    publicPath: process.env.NODE_ENV === 'production'
      ? config.build.assetsPublicPath
      : config.dev.assetsPublicPath
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      '@': resolve('src'),
      variables: resolve('src/styles/variables.styl')
    }
  },
  module: {
    rules: [
      {
        test: /\.(js|vue)$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        include: [resolve('src'), resolve('test')],
        options: {
          formatter: require('eslint-friendly-formatter')
        }
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src'), resolve('test')]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.json/,
        loader: 'json-loader'
      },
      {
        test: /\.pdf/,
        loader: 'file-loader',
        query: {
          name: utils.assetsPath('[name].[ext]')
        }
      },
      {
        test: /\.xml/,
        loader: 'file-loader',
        query: {
          name: utils.assetsPath('[name].[ext]')
        }
      },
      {
        test: /\.md/,
        loader: 'vue-markdown-loader',
        options: markdown
      }
    ]
  }
}
