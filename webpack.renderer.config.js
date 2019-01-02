"use strict"

process.env.BABEL_ENV = `renderer`

const path = require(`path`)
const webpack = require(`webpack`)
const fs = require(`fs-extra`)

const HtmlWebpackPlugin = require(`html-webpack-plugin`)
const VueLoaderPlugin = require(`vue-loader/lib/plugin`)

function resolve(dir) {
  return path.join(__dirname, dir)
}

let rendererConfig = {
  devtool:
    process.env.NODE_ENV === `production`
      ? `#source-map`
      : `#inline-source-map`,
  entry: {
    renderer: path.join(__dirname, `app/src/renderer/main.js`)
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: `babel-loader`,
        include: [path.resolve(__dirname, `app/src/renderer`)],
        exclude: /node_modules/
      },
      {
        test: /\.json$/,
        use: `json-loader`
      },
      {
        test: /\.vue$/,
        use: {
          loader: `vue-loader`
        }
      },
      {
        test: /\.pug$/,
        loader: `pug-plain-loader`
      },
      {
        test: /\.styl(us)?$/,
        use: [`style-loader`, `css-loader`, `stylus-loader`]
      },
      {
        test: /\.css$/,
        use: [`style-loader`, `css-loader`]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        use: [
          {
            loader: `url-loader`,
            query: {
              limit: 10000,
              name: `imgs/[name].[ext]`
            }
          }
        ]
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        use: [
          {
            loader: `url-loader`,
            query: {
              limit: 10000,
              name: `fonts/[name].[ext]`
            }
          }
        ]
      }
    ]
  },
  node: {
    __dirname: false,
    __filename: false
  },
  plugins: [
    new VueLoaderPlugin(),
    // the global.GENTLY below fixes a compile issue with superagent + webpack
    // https://github.com/visionmedia/superagent/issues/672
    new webpack.DefinePlugin({ "global.GENTLY": false }),
    new HtmlWebpackPlugin({
      filename: `index.html`,
      template: `./app/index.ejs`,
      appModules:
        process.env.NODE_ENV !== `production`
          ? path.resolve(__dirname, `app/node_modules`)
          : false,
      styles: fs.readFileSync(`./app/src/renderer/styles/index.css`, `utf8`)
    }),
    new webpack.NoEmitOnErrorsPlugin(),
    // warnings caused by websocket-stream, which has a server-part that is unavailable on the the client
    new webpack.IgnorePlugin(/(bufferutil|utf-8-validate)/),
    // put all modules in node_modules in chunk
    new webpack.optimize.CommonsChunkPlugin({
      name: `vendor`
    })
  ],
  output: {
    filename: `[name].js`,
    libraryTarget: `commonjs2`,
    path: path.join(__dirname, `app/dist`)
  },
  resolve: {
    alias: {
      renderer: resolve(`app/src/renderer`),
      "@": resolve(`app/src/renderer`),
      assets: resolve(`app/src/renderer/assets`),
      scripts: resolve(`app/src/renderer/scripts`),
      common: resolve(`app/src/renderer/components/common`),
      transactions: resolve(`app/src/renderer/components/transactions`),
      govern: resolve(`app/src/renderer/components/govern`),
      staking: resolve(`app/src/renderer/components/staking`),
      wallet: resolve(`app/src/renderer/components/wallet`)
    },
    extensions: [`.js`, `.vue`, `.json`, `.css`, `.node`],
    modules: [
      path.join(__dirname, `app/node_modules`),
      path.join(__dirname, `node_modules`)
    ]
  },
  target: `electron-renderer`
}

/**
 * Adjust rendererConfig for production settings
 */
if (process.env.NODE_ENV === `production`) {
  rendererConfig.devtool = ``

  rendererConfig.plugins.push(
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": `"production"`
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  )
}

module.exports = rendererConfig
