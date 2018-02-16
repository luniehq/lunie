'use strict'

const path = require('path')

let config = {
  // Name of electron app
  // Will be used in production builds
  name: 'Cosmos Voyager',

  // Use ESLint (extends `standard`)
  // Further changes can be made in `.eslintrc.js`
  eslint: false,

  // webpack-dev-server port
  wds_port: 9080,
  lcd_port: 9070,
  lcd_port_prod: 9071,
  relay_port: 9060,
  relay_port_prod: 9061,

  // electron-packager options
  // Docs: https://simulatedgreg.gitbooks.io/electron-vue/content/docs/building_your_app.html
  building: {
    arch: 'x64',
    asar: false,
    dir: path.join(__dirname, 'app'),
    icon: path.join(__dirname, 'app/icons/icon'),
    ignore: /^\/(src|index\.ejs|icons)/,
    out: path.join(__dirname, 'builds'),
    overwrite: true,
    platform: process.env.PLATFORM_TARGET || 'darwin,linux,win32',
    packageManager: 'yarn'
  },

  default_network: 'gaia-2',
  analytics_networks: ['gaia-2', 'gaia-3-dev', 'gaia-3'],
  google_analytics: 'UA-51029217-3',
  sentry_dsn: 'https://4dee9f70a7d94cc0959a265c45902d84:cbf160384aab4cdeafbe9a08dee3b961@sentry.io/288169'
}

config.building.name = config.name

module.exports = config
