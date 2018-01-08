'use strict'

const path = require('path')

let config = {
  // Name of electron app
  // Will be used in production builds
  name: 'Cosmos',

  // Use ESLint (extends `standard`)
  // Further changes can be made in `.eslintrc.js`
  eslint: false,

  // webpack-dev-server port
  port: 9080,

  // electron-builder options
  // Docs: https://www.electron.build/configuration/configuration
  building: {
    appId: 'com.electron.cosmosui',
    copyright: 'Copyright © 2018 Allinbits',
    directories: {
      buildResources: path.join(__dirname, 'builds/resources'),
      app: path.join(__dirname, 'app'),
      output: path.join(__dirname, 'builds')
    },
    nsis: {
      oneClick: false,
      allowElevation: false,
      perMachine: true
    },
    linux: {
      target: 'deb',
      icon: 'png'
    },
    mac: {
      target: 'dmg'
    }
  }
}

config.building.productName = config.name

module.exports = config
