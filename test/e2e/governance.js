"use strict"

let test = require(`tape-promise/tape`)
let { getApp, restart } = require(`./launch.js`)
let {
  navigate,
  waitForText,
  login
  // closeNotifications
} = require(`./common.js`)
// let {
//   addresses
// } = require(`../../app/src/renderer/connectors/lcdClientMock.js`)

/*
 * NOTE: don't use a global `let client = app.client` as the client object changes when restarting the app
 */

test(`Governance`, async function(t) {
  let { app } = await getApp(t)
  // app.env.COSMOS_MOCKED = false
  await restart(app)
  let $ = (...args) => app.client.$(...args)

  await login(app, `testkey`)
  await navigate(app, `Governance`)

  t.test(`display no proposals message`, async function(t) {
    t.equal(
      (await app.client.$$(`.li-proposal`)).length,
      0,
      `it doesn't show any proposal`
    )
    await $(`div*=No Governance Proposals`).waitForExist()
    t.pass(`correct message when there are no proposals`)
    t.end()
  })

  t.end()
})
