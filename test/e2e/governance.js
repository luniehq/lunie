"use strict"

let test = require(`tape-promise/tape`)
let { getApp, restart } = require(`./launch.js`)
let { navigate, login } = require(`./common.js`)
/*
 * NOTE: don't use a global `let client = app.client` as the client object changes when restarting the app
 */

test(`Governance`, async function(t) {
  let { app } = await getApp(t)
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

  t.test(`submit proposal`, async function(t) {
    await app.client.$(`#propose-btn`).click()
    await t.ok(
      await app.client.$(`#modal-propose`).isVisible(),
      `opens modal proposal`
    )
    await app.client.setValue(`#title`, `E2E test proposal title`)
    await app.client.setValue(`#description`, `E2E test proposal title`)
    await app.client.setValue(`#amount`, `10`)
    await t.ok(
      await app.client
        .click(`//button/*[. = 'Submit proposal']`)
        .waitForVisible(
          `//*[. = 'You have successfully submitted a new text proposal']`,
          5 * 1000
        ),
      `successful proposal submission`
    )
    t.equal(
      (await app.client.$$(`.li-proposal`)).length,
      1,
      `displays the proposal table with one element`
    )
    await t.ok(
      await app.client.$(`a*=E2E test proposal title`).isVisible(),
      `shows the newly created proposal`
    )
    t.end()
  })

  t.end()
})
