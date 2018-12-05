"use strict"

let test = require(`tape-promise/tape`)
let { getApp, restart } = require(`./launch.js`)
let {
  navigate,
  waitForText,
  login,
  closeNotifications
} = require(`./common.js`)
let {
  addresses
} = require(`../../app/src/renderer/connectors/lcdClientMock.js`)

/*
 * NOTE: don't use a global `let client = app.client` as the client object changes when restarting the app
 */

test(`wallet`, async function(t) {
  let { app, accounts } = await getApp(t)
  // app.env.COSMOS_MOCKED = false
  await restart(app)

  let $ = (...args) => app.client.$(...args)

  await login(app, `testkey`)

  let balanceEl = denom => {
    return app.client.waitForExist(`.coin-denom=${denom}`, 20000).then(() =>
      $(`.coin-denom=${denom}`)
        .$(`..`)
        .$(`..`)
        .$(`div.li-coin__content__left__amount`)
        .$(`p`)
    )
  }

  t.test(`Coins`, async function(t) {
    t.equal((await app.client.$$(`.li-coin`)).length, 2, `it shows all 2 coins`)
    // denom
    await t.ok(
      await app.client.$(`.coin-denom=Steak`).isVisible(),
      `show coin steak`
    )
    await t.ok(
      await app.client.$(`.coin-denom=Localcoin`).isVisible(),
      `show coin localcoin`
    )
    t.end()
  })

  t.test(`send`, async function(t) {
    async function goToSendPage() {
      await navigate(app, `Wallet`)

      await app.client
        .$(`.coin-denom=Localcoin`)
        .$(`..`)
        .$(`..`)
        .$(`a`)
        .$(`button`)
        .click()
    }

    await navigate(app, `Wallet`)

    let sendBtn = () => $(`.tm-form-footer button`)
    let addressInput = () => $(`#send-address`)
    let amountInput = () => $(`#send-amount`)
    let defaultBalance = 1000.0
    t.test(`Localcoin balance before sending`, async function(t) {
      await app.client.waitForExist(
        `//span[contains(text(), "Send")]`,
        15 * defaultBalance
      )

      let LocalcoinEl = balanceEl(`Localcoin`)
      await waitForText(() => LocalcoinEl, `1,000.0000000000`)
      t.end()
    })

    t.test(`hit send with empty form`, async function(t) {
      await goToSendPage()
      await sendBtn().click()
      t.equal(await sendBtn().getText(), `Send Tokens`, `not sending`)
      t.end()
    })

    t.test(`address w/ less than or greater than 40 chars`, async function(t) {
      await goToSendPage()
      await addressInput().setValue(`012345`)
      await app.client.setValue(`#password`, `1234567890`)
      await sendBtn().click()
      await $(`div*=Address is invalid (012345 too short)`).waitForExist()
      t.pass(`got correct error message`)
      await sendBtn().click()
      t.equal(await sendBtn().getText(), `Send Tokens`, `not sending`)

      let fourtyOneZeros = `01234` + `0`.repeat(36)

      await addressInput().setValue(fourtyOneZeros)

      await sendBtn().click()
      await $(
        `div*=Address is invalid (Invalid checksum for ` + fourtyOneZeros + `)`
      ).waitForExist()
      t.pass(`got correct error message`)
      await sendBtn().click()
      t.equal(await sendBtn().getText(), `Send Tokens`, `not sending`)

      t.end()
    })

    t.test(`address not alphaNum`, async function(t) {
      await goToSendPage()
      await addressInput().setValue(`~`.repeat(40))
      await app.client.setValue(`#password`, `1234567890`)
      await $(
        `div*=Address is invalid (No separator character for ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~)`
      ).waitForExist()
      t.pass(`got correct error message`)

      await sendBtn().click()
      t.equal(await sendBtn().getText(), `Send Tokens`, `not sending`)
      t.end()
    })

    t.test(`correct address mis-typed`, async function(t) {
      await goToSendPage()
      let validAddress = addresses[0]
      let invalidAddress = validAddress.slice(0, -1) + `4`
      await addressInput().setValue(invalidAddress)
      await app.client.setValue(`#password`, `1234567890`)
      await $(
        `div*=Address is invalid (Invalid checksum for ` + invalidAddress + `)`
      ).waitForExist()
      t.pass(`got correct error message`)

      await sendBtn().click()
      t.equal(await sendBtn().getText(), `Send Tokens`, `not sending`)
      t.end()
    })

    t.test(`amount set`, async function(t) {
      await goToSendPage()
      await amountInput().setValue(`100`)
      await sendBtn().click()
      t.equal(await sendBtn().getText(), `Send Tokens`, `not sending`)
      t.end()
    })

    t.test(`send`, async function(t) {
      await goToSendPage()
      await amountInput().setValue(`100`)
      await addressInput().setValue(accounts[1].address)
      await app.client.setValue(`#password`, `1234567890`)
      await sendBtn().click()
      // the confirmation popup will open
      await app.client.$(`#send-confirmation-btn`).click()

      await app.client.waitForExist(`.tm-notification`, 10 * 1000)
      let msg = await app.client.$(`.tm-notification .body`).getText()
      t.ok(msg.includes(`Success`), `Send successful`)
      // close the notifications to have a clean setup for the next tests
      await closeNotifications(app)

      t.end()
    })

    t.test(`own balance updated`, async function(t) {
      await navigate(app, `Wallet`)

      t.equal(
        (await app.client.$$(`.li-coin`)).length,
        2,
        `it shows all 2 coins`
      )

      let LocalcoinEl = () => balanceEl(`Localcoin`)
      await waitForText(LocalcoinEl, `900.0000000000`, 20000)
      t.pass(`balance is reduced by 100`)
      t.end()
    })

    t.test(`sent to self`, async function(t) {
      await goToSendPage()
      await amountInput().setValue(`100`)
      await addressInput().setValue(accounts[0].address)
      await app.client.setValue(`#password`, `1234567890`)
      await sendBtn().click()
      // the confirmation popup will open
      await app.client.$(`#send-confirmation-btn`).click()

      await app.client.waitForExist(`.tm-notification`, 10 * 1000)
      let msg = await app.client.$(`.tm-notification .body`).getText()
      t.ok(msg.includes(`Success`), `Send successful`)
      // close the notifications to have a clean setup for the next tests
      await closeNotifications(app)

      t.end()
    })

    t.test(`showing transactions`, async function(t) {
      await navigate(app, `Transactions`)

      // sent to self
      await app.client.waitForExist(
        `//span[contains(text(), "To yourself!")]`,
        15 * 1000
      )
      // sent to other account
      await app.client.waitForExist(
        `//span[contains(text(), "To ${accounts[1].address}")]`,
        15 * 1000
      )

      t.end()
    })

    t.end()
  })

  t.test(`receive`, async function(t) {
    t.test(`Localcoin balance after receiving`, async function(t) {
      await restart(app)
      await login(app, `testreceiver`)
      await navigate(app, `Wallet`)

      let LocalcoinEl = () => balanceEl(`Localcoin`)
      await app.client.waitForExist(
        `//span[contains(text(), "Send")]`,
        15 * 1000
      )

      await waitForText(LocalcoinEl, `100.0000000000`, 10000)
      t.pass(`received mycoin transaction`)
      t.end()
    })

    t.test(`showing transactions`, async function(t) {
      await navigate(app, `Transactions`)

      // received from other account
      await app.client.waitForExist(
        `//span[contains(text(), "From ${accounts[0].address}")]`,
        15 * 1000
      )

      t.end()
    })

    t.end()
  })

  t.test(`transactions`, async function(t) {
    t.end()
  })

  t.end()
})
