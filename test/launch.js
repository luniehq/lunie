'use strict'

let { Application } = require('spectron')
let test = require('tape-promise/tape')
let electron = require('electron')
let { join } = require('path')
let { newTempDir } = require('./common.js')

// re-use app instance
let app

module.exports = async function launch (t) {
  if (app) return app

  let home = newTempDir()
  console.error(`ui home: ${home}`)

  app = new Application({
    path: electron,
    args: [ join(__dirname, '../app/dist/main.js') ],
    startTimeout: 10000,
    waitTimeout: 10000,
    env: {
      COSMOS_TEST: 'true',
      COSMOS_HOME: home,
      COSMOS_NETWORK: join(__dirname, 'localtestnet')
    }
  })

  try {
    await app.start()
  } catch (error) {
    t.fail(err.message)
  }

  t.test('launch app', async function (t) {
    t.ok(app.isRunning(), 'app is running')
    t.end()
  })

  t.test('wait for app to load', async function (t) {
    await app.client.waitForExist('.header-item-logo', 5000)
    t.pass('app loaded')
    t.end()
  })

  return app
}

test.onFinish(() => app ? app.stop() : null)
