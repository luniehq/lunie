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
    args: [
      join(__dirname, '../../app/dist/main.js'),
      '--disable-gpu',
      '--no-sandbox'
    ],
    startTimeout: 10000,
    waitTimeout: 10000,
    env: {
      COSMOS_TEST: 'true',
      COSMOS_HOME: home,
      COSMOS_NETWORK: join(__dirname, 'gaia-1')
    }
  })

  await app.start()

  t.test('launch app', function (t) {
    t.ok(app.isRunning(), 'app is running')
    t.end()
  })

  t.test('wait for app to load', async function (t) {
    await app.client.waitForExist('.header-item-logo', 5000)
    .then(() => t.pass('app loaded'))
    .catch(e => {
      printAppLog(app)
      t.fail()
      throw e
    })
    t.end()
  })

  return app
}

test.onFinish(() => app ? app.stop() : null)

function printAppLog (app) {
  app.client.getMainProcessLogs().then(function (logs) {
    logs.forEach(function (log) {
      console.log(log)
    })
  })
  app.client.getRenderProcessLogs().then(function (logs) {
    logs.forEach(function (log) {
      console.log(log.message)
      console.log(log.source)
      console.log(log.level)
    })
  })
}
