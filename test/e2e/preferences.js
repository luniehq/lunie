"use strict"

let test = require(`tape-promise/tape`)
let { getApp, restart } = require(`./launch.js`)
let {
  navigateToPreferences,
  sleep,
  login,
  selectOption
} = require(`./common.js`)

/*
* NOTE: don't use a global `let client = app.client` as the client object changes when restarting the app
*/

test(`preferences`, async function(t) {
  let { app } = await getApp(t)
  await restart(app)

  let $ = (...args) => app.client.$(...args)

  await login(app, `testkey`)

  t.test(`change`, async function(t) {
    await navigateToPreferences(app)

    let networkSelect = () => $(`#select-network select`)

    t.test(`default network`, async function(t) {
      let option = await networkSelect().getValue()
      t.equal(option.toString(), `live`, `Live Testnet is correct`)
      t.end()
    })
    t.test(`mock network`, async function(t) {
      await selectOption(app, `#select-network select`, `Offline`)
      await app.client.waitForVisible(`.tm-session-wrapper`, 5000)

      await login(app, `default`)
      await navigateToPreferences(app)

      await sleep(1000)
      let network = await app.client
        .$(`#tm-connected-network__string`)
        .getHTML()
      t.ok(
        network.indexOf(`Offline Demo`) !== -1,
        `network indicator shows 'Offline Demo'`
      )

      t.end()
    })

    t.end()
  })

  t.end()
})
