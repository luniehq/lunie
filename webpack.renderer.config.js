"use strict"

process.env.BABEL_ENV = `renderer`

const path = require(`path`)
const webpack = require(`webpack`)
const fs = require(`fs`)

const HtmlWebpackPlugin = require(`html-webpack-plugin`)
const VueLoaderPlugin = require(`vue-loader/lib/plugin`)
// const BundleAnalyzerPlugin = require(`webpack-bundle-analyzer`)
// .BundleAnalyzerPlugin
const CleanWebpackPlugin = require(`clean-webpack-plugin`)
const SentryPlugin = require(`@sentry/webpack-plugin`)

function resolve(dir) {
  return path.join(__dirname, dir)
}

const buildPath = path.join(__dirname, `dist`)

const commitHash = require(`child_process`)
  .execSync(`git rev-parse HEAD`)
  .toString()
  .trim()

const devPlugins = process.env.CIRCLECI ? [] : [
  new CleanWebpackPlugin(),
  // new BundleAnalyzerPlugin({
  //   analyzerMode: `static`,
  //   openAnalyzer: false
  // })
]

const rendererConfig = {
  devtool: process.env.NODE_ENV === `production` ?
    `#cheap-source-map` : `#inline-source-map`,
  entry: {
    renderer: path.join(__dirname, `src/main.js`)
  },
  module: {
    rules: [{
      test: /\.js$/,
      use: `babel-loader`,
      include: [path.resolve(__dirname, `src`)],
      exclude: /node_modules/
    },
    {
      test: /\.vue$/,
      use: {
        loader: `vue-loader`
      }
    },
    {
      test: /\.css$/,
      use: [
        `style-loader`,
        {
          loader: `css-loader`,
          options: {
            importLoaders: 1
          }
        },
        {
          loader: `postcss-loader`,
          options: {
            sourceMap: true,
            ident: `postcss`,
            plugins: loader => [
              require(`postcss-import`)({
                root: loader.resourcePath
              }),
              require(`postcss-preset-env`)({
                browsers: `last 3 versions`
              }),
              require(`cssnano`)()
            ]
          }
        }
      ]
    },
    {
      test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
      use: [{
        loader: `url-loader`,
        query: {
          limit: 10000,
          name: `images/[name].[ext]`
        }
      }]
    },
    {
      test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
      use: [{
        loader: `url-loader`,
        query: {
          limit: 10000,
          name: `fonts/[name].[ext]`
        }
      }]
    }
    ]
  },
  node: {
    __dirname: false,
    __filename: false,
    fs: `empty`
  },
  plugins: [
    new VueLoaderPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    // the global.GENTLY below fixes a compile issue with superagent + webpack
    // https://github.com/visionmedia/superagent/issues/672
    new webpack.DefinePlugin({
      "global.GENTLY": false
    }),
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        FAUCET: JSON.stringify(process.env.FAUCET),
        RPC: JSON.stringify(process.env.RPC),
        STARGATE: JSON.stringify(process.env.STARGATE),
        RELEASE: JSON.stringify(commitHash)
      }
    }),
    new HtmlWebpackPlugin({
      filename: `index.html`,
      template: `./src/index.ejs`,
      styles: fs.readFileSync(`./src/styles/index.css`, `utf8`),
      favicon: `./src/assets/images/favicon.ico`
    }),
    // warnings caused by websocket-stream, which has a server-part that is unavailable on the the client
    new webpack.IgnorePlugin(/(bufferutil|utf-8-validate)/),
    ...devPlugins
  ],
  output: {
    // contenthash is known to be buggy in webpack4, hash refers to the whole build and
    // chunkhash is even more unpredictable. The non determinism is due to the moduleId defined at run time
    // Hopefully webpack5 will solve the non-deterministic behaviour here
    filename: `[name].[hash].js`,
    path: buildPath
  },
  resolve: {
    alias: {
      src: resolve(`src`),
      "@": resolve(`src`),
      assets: resolve(`src/assets`),
      scripts: resolve(`src/scripts`),
      common: resolve(`src/components/common`),
      transactions: resolve(`src/components/transactions`),
      govern: resolve(`src/components/govern`),
      staking: resolve(`src/components/staking`),
      wallet: resolve(`src/components/wallet`)
    },
    extensions: [`.js`, `.vue`, `.json`, `.css`, `.node`],
    modules: [path.join(__dirname, `node_modules`)]
  },
  devServer: {
    contentBase: [
      path.join(__dirname, `dist`),
      path.join(__dirname, `app`)
    ],
    stats: `errors-only`
  },
  optimization: {
    runtimeChunk: `single`,
    splitChunks: {
      chunks: `all`,
      maxInitialRequests: Infinity,
      minSize: 0,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            const packageName = module.context.match(
              /[\\/]node_modules[\\/](.*?)([\\/]|$)/
            )[1]

            // npm package names are URL-safe, but some servers don't like @ symbols
            return `npm.${packageName.replace(`@`, ``)}`
          }
        }
      }
    }
  }
}

/**
 * Adjust rendererConfig for production settings
 */
if (process.env.NODE_ENV === `production`) {
  rendererConfig.plugins.push(
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  )
}

if (process.env.RELEASE) {
  console.log(`releasing to Sentry`)
  rendererConfig.plugins.push(
    new SentryPlugin({
      include: `./dist`,
      validate: true
    })
  )
}

module.exports = rendererConfig
