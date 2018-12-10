"use strict"

process.env.BABEL_ENV = `main`

const path = require(`path`)
const webpack = require(`webpack`)

let mainConfig = {
  devtool:
    process.env.NODE_ENV === `production`
      ? `#source-map`
      : `#inline-source-map`,
  entry: {
    main: path.join(__dirname, `app/src/main/index.js`)
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: `babel-loader`,
        exclude: /node_modules/
      },
      {
        test: /\.json$/,
        loader: `json-loader`
      },
      {
        test: /\.node$/,
        loader: `node-loader`
      }
    ]
  },
  node: {
    __dirname: false,
    __filename: false
  },
  output: {
    filename: `[name].js`,
    sourceMapFilename: `[name].js.map`,
    libraryTarget: `commonjs2`,
    path: path.join(__dirname, `app/dist`)
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": `"` + process.env.NODE_ENV + `"`
    })
  ],
  resolve: {
    extensions: [`.js`, `.json`, `.node`],
    modules: [path.join(__dirname, `node_modules`)]
  },
  target: `electron-main`
}

module.exports = mainConfig
