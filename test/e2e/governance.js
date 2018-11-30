"use strict"

let test = require(`tape-promise/tape`)
let { getApp, restart } = require(`./launch.js`)
let { navigate, login, closeNotifications } = require(`./common.js`)
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
    await app.client.setValue(`#amount`, 5)
    await t.ok(
      await app.client
        .click(`//button/*[. = 'Submit proposal']`)
        .waitForVisible(
          `//*[. = 'You have successfully submitted a new text proposal']`,
          4 * 1000
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
    await closeNotifications(app)
    t.end()
  })

  t.test(`proposal page`, async function(t) {
    await app.client.$(`a*=E2E test proposal title`).click()
    await t.ok(
      await app.client.$(`.proposal`).isVisible(),
      `shows the proposal page`
    )
    t.end()
  })

  t.test(`deposit`, async function(t) {
    await t.ok(
      await app.client.$(`.validator-profile__status.yellow`).isVisible(),
      `the proposal is on deposit period`
    )
    await app.client.$(`#deposit-btn`).click()
    await t.ok(
      await app.client.$(`#modal-deposit`).isVisible(),
      `opens modal deposit`
    )
    await app.client.setValue(`#amount`, 10)
    await t.ok(
      await app.client
        .$(`#submit-deposit`)
        .click()
        .waitForVisible(`.tm-notification`, 4 * 1000),
      `successful deposit`
    )
    // TODO: check if deposit increased
    // let deposit = app.client.$(`//dd/*[. = 'Deposit']`)
    await closeNotifications(app)
    t.end()
  })

  t.test(`vote`, async function(t) {
    await t.ok(
      await app.client.$(`.validator-profile__status.blue`).isVisible(),
      `the proposal is on voting period`
    )
    await app.client.$(`#vote-btn`).click()
    await t.ok(
      await app.client.$(`#modal-vote`).isVisible(),
      `opens modal vote`
    )
    // await t.ok(
    //   await app.client
    //     .click(`//button/*[. = 'Submit proposal']`)
    //     .waitForVisible(
    //       `//*[. = 'You have successfully submitted a new text proposal']`,
    //       5 * 1000
    //     ),
    //   `successful proposal submission`
    // )
    // TODO: check if tally increased, blocked by SDK v.0.27
    t.end()
  })

  t.end()
})
