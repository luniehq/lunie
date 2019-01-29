"use strict"

const test = require(`tape-promise/tape`)
const { getApp, restart } = require(`./launch.js`)
const {
  navigate,
  login,
  closeNotifications,
  waitForText
} = require(`./common.js`)
/*
 * NOTE: don't use a global `let client = app.client` as the client object changes when restarting the app
 */

test(`Governance`, async function(t) {
  const { app } = await getApp(t)
  await restart(app)
  const $ = (...args) => app.client.$(...args)

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
    const balance = parseInt(
      (await app.client.$(`.total-atoms__value`).getText()).split(`.`)[0]
    )
    await app.client
      .$(`#propose-btn`)
      .click()
      .waitForVisible(`#modal-propose`)
    await app.client
      .setValue(`#title`, `E2E test proposal title`)
      .setValue(`#description`, `E2E test proposal title`)
      .setValue(`#amount`, 5)
      .setValue(`#password`, `1234567890`)
    await t.ok(
      await app.client
        .click(`//button/*[. = 'Submit']`)
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

    console.log(`Testing total balance updated`)
    await waitForText(
      () => app.client.$(`.total-atoms__value`),
      `${balance - 5}.0000…`
    )
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
    const balance = parseInt(
      (await app.client.$(`.total-atoms__value`).getText()).split(`.`)[0]
    )
    const deposit = () =>
      $(`//dt[contains(text(), "Deposit")]`)
        .$(`..`)
        .$(`dd`)
    const amount = parseInt((await deposit().getText()).split(` `)[0])
    await t.ok(
      await app.client.$(`.page-profile__status.yellow`).isVisible(),
      `the proposal is open for deposits`
    )
    await app.client
      .$(`#deposit-btn`)
      .click()
      .waitForVisible(`#modal-deposit`)
    await app.client.setValue(`#amount`, 10).setValue(`#password`, `1234567890`)
    await t.ok(
      await app.client
        .$(
          `//*[@id = 'modal-deposit']//button//*[normalize-space() = 'Submit']`
        )
        .click()
        .waitForVisible(
          `//*[. = 'You have successfully deposited your STAKEs on proposal #1']`,
          4 * 1000
        ),
      `successful deposit`
    )
    const newAmount = parseInt((await deposit().getText()).split(` `)[0])
    t.equal(
      newAmount,
      amount + 10,
      `increments the deposit count displayed on the proposal page`
    )
    await closeNotifications(app)

    console.log(`Testing total balance updated`)
    await waitForText(
      () => app.client.$(`.total-atoms__value`),
      `${balance - 10}.0000…`,
      10 * 10000
    )
    t.end()
  })

  t.test(`vote`, async function(t) {
    await t.ok(
      await app.client.$(`.page-profile__status.green`).isVisible(),
      `the proposal is open for voting`
    )
    await app.client
      .$(`#vote-btn`)
      .click()
      .waitForVisible(`#modal-vote`)

    await app.client.$(`#vote-yes`).click()
    await app.client.setValue(`#password`, `1234567890`)
    await t.ok(
      await app.client
        .$(`//*[@id = 'modal-vote']//button//*[normalize-space() = 'Submit']`)
        .click()
        .waitForVisible(
          `//*[. = 'You have successfully voted Yes on proposal #1']`,
          4 * 1000
        ),
      `successful vote`
    )
    // TODO: check if tally increased, blocked by SDK v.0.27
    t.end()
  })

  t.end()
})
