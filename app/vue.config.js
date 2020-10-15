const path = require(`path`)
const webpack = require(`webpack`)
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin
const { version } = require("./package.json")

function resolve(dir) {
  return path.join(__dirname, dir)
}

const config = {
  publicPath: `/`,
  chainWebpack: (config) => {
    config.plugins.delete(`prefetch`)
  },
  configureWebpack: () => {
    const config = {
      resolve: {
        alias: {
          src: resolve(`src`),
          "@": resolve(`src`),
          assets: resolve(`src/assets`),
          scripts: resolve(`src/scripts`),
          common: resolve(`src/components/common`),
          account: resolve(`src/components/account`),
          governance: resolve(`src/components/governance`),
          network: resolve(`src/components/network`),
          staking: resolve(`src/components/staking`),
          transactions: resolve(`src/components/transactions`),
          session: resolve(`src/components/session`),
          test: resolve(`test`),
        },
        extensions: [`.js`, `.vue`, `.css`],
      },
      plugins: [
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        new webpack.DefinePlugin({
          "process.env": {
            NODE_ENV: JSON.stringify(process.env.NODE_ENV),
            NETWORK: JSON.stringify(process.env.NETWORK),
            SENTRY_DSN: JSON.stringify(process.env.SENTRY_DSN),
            LUNIE_VERSION: JSON.stringify(version),
            GOOGLE_ANALYTICS_UID: JSON.stringify(
              process.env.GOOGLE_ANALYTICS_UID
            ),
            MOBILE_APP: JSON.stringify(process.env.MOBILE_APP),
          },
        }),
        // new BundleAnalyzerPlugin() // uncomment to analyze deps
      ],
      optimization: {
        splitChunks: {
          chunks: "all",
          minSize: 10000,
          maxSize: 250000,
        },
      },
      devtool: "eval-source-map",
    }

    return config
  },

  pluginOptions: {
    lintStyleOnBuild: false,
    stylelint: {},
  },
}

// css config breaks hot reloading
if (process.env.NODE_ENV === `production`) {
  config.css = {
    extract: { ignoreOrder: true },
  }
}

module.exports = config
