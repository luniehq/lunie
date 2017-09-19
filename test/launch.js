'use strict'

let { Application } = require('spectron')
let test = require('tape-promise/tape')
let electron = require('electron')
let { join } = require('path')
let { tmpdir } = require('os')

// re-use app instance
let app

module.exports = async function launch (t) {
  if (app) return app

  let home = join(tmpdir(), Math.random().toString(36).slice(2))
  console.error(`COSMOS_HOME: ${home}`)

  app = new Application({
    path: electron,
    args: [ join(__dirname, '../app/dist/main.js') ],
    startTimeout: 10000,
    waitTimeout: 10000,
    env: {
      COSMOS_TEST: 'true',
      COSMOS_HOME: home
    }
  })
  await app.start()

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
