const path = require(`path`)
const webpack = require(`webpack`)
const CSPWebpackPlugin = require(`csp-webpack-plugin`)

function resolve(dir) {
  return path.join(__dirname, dir)
}

const commitHash = require(`child_process`)
  .execSync(`git rev-parse HEAD`)
  .toString()
  .trim()

module.exports = {
  publicPath: `/`,
  configureWebpack: () => {
    const config = {
      resolve: {
        alias: {
          src: resolve(`src`),
          "@": resolve(`src`),
          assets: resolve(`src/assets`),
          scripts: resolve(`src/scripts`),
          common: resolve(`src/components/common`),
          governance: resolve(`src/components/governance`),
          network: resolve(`src/components/network`),
          staking: resolve(`src/components/staking`),
          transactions: resolve(`src/components/transactions`),
          wallet: resolve(`src/components/wallet`),
          test: resolve(`test`)
        },
        extensions: [`.js`, `.vue`, `.css`]
      },
      plugins: [
        new webpack.DefinePlugin({
          "process.env": {
            NODE_ENV: JSON.stringify(process.env.NODE_ENV),
            RPC: JSON.stringify(process.env.RPC),
            STARGATE: JSON.stringify(process.env.STARGATE),
            SENTRY_DSN: JSON.stringify(process.env.SENTRY_DSN),
            RELEASE: JSON.stringify(commitHash),
            GOOGLE_ANALYTICS_UID: JSON.stringify(
              process.env.GOOGLE_ANALYTICS_UID
            )
          }
        })
      ]
    }

    if (process.env.NODE_ENV === `production` && !process.env.E2E_TESTS) {
      config.plugins.push(
        // adds the content security policy to the index.html
        new CSPWebpackPlugin({
          "object-src": `'none'`,
          "base-uri": `'self'`,
          "default-src": `'self'`,
          "script-src": [`'self'`, `https://*.lunie.io`],
          "worker-src": `'none'`,
          "style-src": [`'self'`, `'unsafe-inline'`],
          "connect-src": [
            // third party tools
            `https://api-iam.intercom.io`,
            // mainnet
            `https://stargate.lunie.io`,
            `wss://rpc.lunie.io:26657`,
            `https://stargate.cosmos.network`,
            `wss://rpc.cosmos.network:26657`,
            ...[process.env.STARGATE].filter(x => x !== undefined),
            ...[process.env.RPC]
              .filter(x => x !== undefined)
              .map(x => x.replace("https", "wss"))
          ],
          "frame-src": [`'self'`, `https://api-iam.intercom.io`],
          "img-src": [`'self'`, `https://www.google-analytics.com/`]
        })
      )
    }

    return config
  },

  pluginOptions: {
    lintStyleOnBuild: false,
    stylelint: {}
  }
}
