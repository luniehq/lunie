'use strict'

let { Application } = require('spectron')
let test = require('tape')
let electron = require('electron')
let { join } = require('path')

async function launch () {
  let app = new Application({
    path: electron,
    args: [ join(__dirname, '../app/dist/main.js') ],
    startTimeout: 10000,
    waitTimeout: 10000,
    env: { COSMOS_TEST: 'true' }
  })
  await app.start()
  return app
}

test('launch app', async (t) => {
  let app = await launch()
  t.ok(app.isRunning(), 'app launched')
  app.stop()
  t.end()
})
