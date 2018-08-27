let test = require("tape-promise/tape")
let { getApp, restart } = require("./launch.js")
let {
  navigate,
  waitForText,
  login,
  closeNotifications
} = require("./common.js")
let {
  addresses
} = require("../../app/src/renderer/connectors/lcdClientMock.js")
console.log(addresses)

/*
* NOTE: don't use a global `let client = app.client` as the client object changes when restarting the app
*/

test("wallet", async function(t) {
  let { app, accounts } = await getApp(t)
  // app.env.COSMOS_MOCKED = false
  await restart(app)

  let $ = (...args) => app.client.$(...args)

  await login(app, "testkey")

  let balanceEl = denom => {
    let balanceElemSlector = `//div[contains(text(), "${denom.toUpperCase()}")]`
    // app.client.getHTML("#part-available-balances").then(result => {
    //   console.log(result)
    // })
    return app.client.waitForExist(balanceElemSlector, 20000).then(() =>
      $(balanceElemSlector)
        .$("..")
        .$("div.tm-li-dd")
    )
  }

  t.test("send", async function(t) {
    async function goToSendPage() {
      await navigate(app, "Wallet")

      await $("#part-available-balances")
        .$(".tm-li-dt=LOCAL_1TOKEN")
        .$("..")
        .$("..")
        .click()
    }

    await navigate(app, "Wallet")

    let sendBtn = () => $(".tm-form-footer button")
    let addressInput = () => $("#send-address")
    let amountInput = () => $("#send-amount")
    let defaultBalance = 1000
    t.test("LOCAL_1TOKEN balance before sending", async function(t) {
      await app.client.waitForExist(
        `//span[contains(text(), "Send")]`,
        15 * 1000
      )

      let LOCAL_1TOKENEl = balanceEl("LOCAL_1TOKEN")
      await waitForText(() => LOCAL_1TOKENEl, defaultBalance.toString())
      t.end()
    })

    t.test("hit send with empty form", async function(t) {
      await goToSendPage()
      await sendBtn().click()
      t.equal(await sendBtn().getText(), "Send Tokens", "not sending")
      t.end()
    })

    t.test("address w/ less than or greater than 40 chars", async function(t) {
      await goToSendPage()
      await addressInput().setValue("012345")
      await sendBtn().click()
      await $("div*=Address is invalid (012345 too short)").waitForExist()
      t.pass("got correct error message")
      await sendBtn().click()
      t.equal(await sendBtn().getText(), "Send Tokens", "not sending")

      let fourtyOneZeros = "01234" + "0".repeat(36)

      await addressInput().setValue(fourtyOneZeros)

      await sendBtn().click()
      await $(
        "div*=Address is invalid (Invalid checksum for " + fourtyOneZeros + ")"
      ).waitForExist()
      t.pass("got correct error message")
      await sendBtn().click()
      t.equal(await sendBtn().getText(), "Send Tokens", "not sending")

      t.end()
    })

    t.test("address not alphaNum", async function(t) {
      await goToSendPage()
      await addressInput().setValue("~".repeat(40))

      await $(
        "div*=Address is invalid (No separator character for ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~)"
      ).waitForExist()
      t.pass("got correct error message")

      await sendBtn().click()
      t.equal(await sendBtn().getText(), "Send Tokens", "not sending")
      t.end()
    })

    t.test("correct address mis-typed", async function(t) {
      await goToSendPage()
      let validAddress = addresses[0]
      let invalidAddress = validAddress.slice(0, -1) + "4"
      await addressInput().setValue(invalidAddress)

      await $(
        "div*=Address is invalid (Invalid checksum for " + invalidAddress + ")"
      ).waitForExist()
      t.pass("got correct error message")

      await sendBtn().click()
      t.equal(await sendBtn().getText(), "Send Tokens", "not sending")
      t.end()
    })

    t.test("amount set", async function(t) {
      await goToSendPage()
      await amountInput().setValue("100")
      await sendBtn().click()
      t.equal(await sendBtn().getText(), "Send Tokens", "not sending")

      t.end()
    })

    t.test("send", async function(t) {
      await goToSendPage()
      await amountInput().setValue("100")
      await addressInput().setValue(accounts[1].address)
      await sendBtn().click()
      // the confirmation popup will open
      await app.client.$("#send-confirmation-btn").click()

      await app.client.waitForExist(".tm-notification", 10 * 1000)
      let msg = await app.client.$(".tm-notification .body").getText()
      console.log("msg", msg)
      t.ok(msg.includes("Success"), "Send successful")
      // close the notifications to have a clean setup for the next tests
      await closeNotifications(app)

      t.end()
    })

    t.test("own balance updated", async function(t) {
      await navigate(app, "Wallet")

      let mycoinEl = () => balanceEl("LOCAL_1TOKEN")
      await waitForText(mycoinEl, (defaultBalance - 100).toString(), 10000)
      t.pass("balance is reduced by 100")
      t.end()
    })

    t.end()
  })

  t.test("receive", async function(t) {
    t.test("LOCAL_1TOKEN balance after receiving", async function(t) {
      await restart(app)
      await login(app, "testreceiver")
      await navigate(app, "Wallet")

      let LOCAL_1TOKENEl = () => balanceEl("LOCAL_1TOKEN")
      await app.client.waitForExist(
        `//span[contains(text(), "Send")]`,
        15 * 1000
      )

      await waitForText(LOCAL_1TOKENEl, "100", 5000)
      t.pass("received mycoin transaction")
      t.end()
    })

    t.end()
  })

  t.end()
})
