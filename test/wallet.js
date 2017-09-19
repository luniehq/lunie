let test = require('tape-promise/tape')
let launchApp = require('./launch.js')
let { navigate } = require('./common.js')

test('wallet', async function (t) {
  let app, client
  let el = (...args) => client.$(...args)

  app = await launchApp(t)
  client = app.client

  navigate(t, client, 'Balances')

  t.end()
})
