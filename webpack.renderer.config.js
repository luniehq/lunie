"use strict"

process.env.BABEL_ENV = `renderer`

const path = require(`path`)
const webpack = require(`webpack`)
const fs = require(`fs`)

const HtmlWebpackPlugin = require(`html-webpack-plugin`)
const CSPWebpackPlugin = require(`csp-webpack-plugin`)
const VueLoaderPlugin = require(`vue-loader/lib/plugin`)
// const BundleAnalyzerPlugin = require(`webpack-bundle-analyzer`)
// .BundleAnalyzerPlugin
const CleanWebpackPlugin = require(`clean-webpack-plugin`)
const SentryPlugin = require(`@sentry/webpack-plugin`)

function resolve(dir) {
  return path.join(__dirname, dir)
}

const buildPath = path.join(__dirname, `app/dist`)

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

const production = process.env.NODE_ENV === `production`

const rendererConfig = {
  devtool: production ?
    `#cheap-source-map` : `#inline-source-map`,
  entry: {
    renderer: path.join(__dirname, `app/src/renderer/main.js`)
  },
  module: {
    rules: [{
      test: /\.js$/,
      use: `babel-loader`,
      include: [path.resolve(__dirname, `app/src/renderer`)],
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
        // process.env.NODE_ENV !== `production`
        //   ? `vue-style-loader`
        //   : MiniCssExtractPlugin.loader,
        MiniCssExtractPlugin.loader,
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
        loader: `file-loader`,
        query: {
          name: `images/[name].[ext]`
        }
      }]
    },
    {
      test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
      use: [{
        loader: `file-loader`,
        query: {
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
      template: `./app/index.ejs`,
      appModules: production ? false :
        path.resolve(__dirname, `app/node_modules`),
      styles: fs.readFileSync(`./app/src/renderer/styles/index.css`, `utf8`),
      favicon: `./app/static/icons/favicon.ico`
    }),
    new CSPWebpackPlugin({
      'object-src': `'none'`,
      'base-uri': `'self'`,
      'default-src': `'self'`,
      'script-src': [
        `'self'`,
        `https://app.appzi.io/`,
        production ? `https://*.lunie.io` : `https://Localhost:9080`
      ],
      'worker-src': `'none'`,
      'style-src': `'self'`,
      'connect-src':
        !production ? `*` : [
          // third party tools
          `https://sentry.io`,
          `https://appzi-collector-b.azurewebsites.net`,
          // mainnet
          `https://stargate.cosmos.network`,
          `wss://rpc.cosmos.network:26657`,
          // testnet
          `https://sntajlxzsg.execute-api.eu-central-1.amazonaws.com/`,
          `wss://test.voyager.ninja:26657`
        ],
      'frame-src': [`'self'`, `https://app.appzi.io/`]
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
  devServer: {
    contentBase: [
      path.join(__dirname, `app/dist`),
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
      include: `./app/dist`,
      validate: true
    })
  )
}

module.exports = rendererConfig
