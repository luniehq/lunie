'use strict'

let { Application } = require('spectron')
let test = require('tape-promise/tape')
let electron = require('electron')
let { join } = require('path')
let { tmpdir } = require('os')

async function launch () {
  let home = join(tmpdir(), Math.random().toString(36).slice(2))
  console.error(`COSMOS_HOME: ${home}`)

  let app = new Application({
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
  return app
}

let app, client

test('launch app', async (t) => {
  app = await launch()
  client = app.client
  t.ok(app.isRunning(), 'app launched')
  t.end()
})

test('wait for app to load', async (t) => {
  await client.waitForExist('.header-item-logo', 5000)
  t.pass('loaded')
  t.end()
})

test.onFinish(() => app.stop())
