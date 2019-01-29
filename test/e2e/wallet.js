"use strict"

const test = require(`tape-promise/tape`)
const { getApp, restart } = require(`./launch.js`)
const {
  navigate,
  waitForText,
  login,
  closeNotifications
} = require(`./common.js`)

/*
 * NOTE: don't use a global `let client = app.client` as the client object changes when restarting the app
 */

test(`wallet`, async function(t) {
  const { app, accounts } = await getApp(t)
  // app.env.COSMOS_MOCKED = false
  await restart(app)

  const $ = (...args) => app.client.$(...args)

  await login(app, `testkey`)

  const balanceEl = denom => {
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
      await app.client.$(`.coin-denom=STAKE`).isVisible(),
      `show coin stake`
    )
    await t.ok(
      await app.client.$(`.coin-denom=localcoin`).isVisible(),
      `show coin localcoin`
    )
    t.end()
  })

  t.test(`send`, async function(t) {
    async function showSendModal() {
      await navigate(app, `Wallet`)

      await app.client.click(
        `//*[@id = 'li-coin--localcoin']//button//*[normalize-space() = 'Send']`
      )
    }

    const sendBtn = () =>
      $(`//*[@id = 'send-modal']//button//*[normalize-space() = 'Submit']`)
    const addressInput = () => $(`#send-address`)
    const amountInput = () => $(`#amount`)
    const defaultBalance = 1000.0

    t.test(`Localcoin balance before sending`, async function(t) {
      await app.client.waitForExist(
        `//span[contains(text(), "Send")]`,
        15 * defaultBalance
      )

      const LocalcoinEl = balanceEl(`localcoin`)
      await waitForText(() => LocalcoinEl, `1,000.0000000000`)
      t.end()
    })

    t.test(`send`, async function(t) {
      await showSendModal()
      await addressInput().setValue(accounts[1].address)
      await amountInput().setValue(`10`)
      await app.client.setValue(`#password`, `1234567890`)
      await sendBtn().click()

      await app.client.waitForExist(`.tm-notification`, 10 * 1000)
      const msg = await app.client.$(`.tm-notification .body`).getText()
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

      const LocalcoinEl = () => balanceEl(`localcoin`)
      await waitForText(LocalcoinEl, `990.0000000000`, 20000)
      t.pass(`balance is reduced by 100`)
      t.end()
    })

    t.test(`sent to self`, async function(t) {
      await showSendModal()
      await amountInput().setValue(`10`)
      await addressInput().setValue(accounts[0].address)
      await app.client.setValue(`#password`, `1234567890`)
      await sendBtn().click()

      await app.client.waitForExist(`.tm-notification`, 10 * 1000)
      const msg = await app.client.$(`.tm-notification .body`).getText()
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

      const LocalcoinEl = () => balanceEl(`localcoin`)
      await app.client.waitForExist(
        `//span[contains(text(), "Send")]`,
        15 * 1000
      )

      await waitForText(LocalcoinEl, `10.0000000000`, 10000)
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
