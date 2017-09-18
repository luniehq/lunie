'use strict'

let { Application } = require('spectron')
let test = require('tape')
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

test('launch app', async (t) => {
  let app = await launch()
  t.ok(app.isRunning(), 'app launched')
  t.end()
})
