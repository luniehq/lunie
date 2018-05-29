let { spawn } = require("child_process")
let test = require("tape-promise/tape")
let { getApp, restart } = require("./launch.js")
let {
  navigate,
  newTempDir,
  waitForText,
  sleep,
  login,
  closeNotifications
} = require("./common.js")

let binary = process.env.BINARY_PATH

/*
* NOTE: don't use a global `let client = app.client` as the client object changes when restarting the app
*/

function cliSendCoins(home, to, amount) {
  let child = spawn(binary, [
    "client",
    "tx",
    "send",
    "--name",
    "testkey",
    "--to",
    to,
    "--amount",
    amount,
    "--home",
    home
  ])
  child.stdin.write("1234567890\n")
  return new Promise((resolve, reject) => {
    child.once("error", reject)
    child.once("exit", resolve)
  })
}

test("wallet", async function(t) {
  let { app, home } = await getApp(t)
  await restart(app)

  let $ = (...args) => app.client.$(...args)

  await login(app, "default")

  let balanceEl = denom => {
    console.log("looking for " + denom.toUpperCase())
    // let balanceElemSlector = "div=" + denom.toUpperCase()
    let balanceElemSlector = `//div[contains(text(), "${denom.toUpperCase()}")]`
    app.client.getHTML("#part-available-balances").then(result => {
      console.log(result)
    })
    return app.client.waitForExist(balanceElemSlector, 20000).then(() =>
      $(balanceElemSlector)
        .$("..")
        .$("div.ni-li-dd")
    )
  }

  t.test("send", async function(t) {
    async function goToSendPage() {
      await navigate(app, "Wallet")
      await $("#part-available-balances")
        .$(".ni-li-dt=FERMION")
        .$("..")
        .$("..")
        .click()
    }

    await navigate(app, "Wallet")

    let sendBtn = () => $(".ni-form-footer button")
    let addressInput = () => $("#send-address")
    let amountInput = () => $("#send-amount")
    let denomBtn = denom => $(`option=${denom.toUpperCase()}`)
    let balance = 9007199254740992
    t.test("fermion balance before sending", async function(t) {
      await app.client.waitForExist(
        `//span[contains(text(), "Send")]`,
        15 * 1000
      )

      let fermionEl = balanceEl("fermion")
      let balance = await fermionEl.getText()
      t.equal(balance, balance.toString(), "fermion balance is correct")
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
      await $("div*=Address must be exactly 40 characters").waitForExist()
      t.pass("got correct error message")
      await sendBtn().click()
      t.equal(await sendBtn().getText(), "Send Tokens", "not sending")

      await addressInput().setValue("0".repeat(41))

      await sendBtn().click()
      await $("div*=Address must be exactly 40 characters").waitForExist()
      t.pass("got correct error message")
      await sendBtn().click()
      t.equal(await sendBtn().getText(), "Send Tokens", "not sending")

      t.end()
    })

    t.test("address w/ 40 chars", async function(t) {
      await goToSendPage()
      await addressInput().setValue("0".repeat(40))

      t.notOk(
        await app.client.isExisting(
          "div*=Address must be exactly 40 characters"
        ),
        "no error message"
      )
      await sendBtn().click()
      t.equal(await sendBtn().getText(), "Send Tokens", "not sending")
      t.end()
    })

    t.test("address not alphaNum", async function(t) {
      await goToSendPage()
      await addressInput().setValue("~".repeat(40))

      await $("div*=must contain only alphanumeric characters").waitForExist()
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
      await addressInput().setValue("30E64F9A3FA6C2B9864DADDEDA29CB667BF8366C")
      await sendBtn().click()
      await app.client.waitForExist(".ni-notification", 10 * 1000)
      let msg = await app.client.$(".ni-notification .body").getText()
      t.ok(msg.includes("Success"), "Send successful")
      // close the notifications to have a clean setup for the next tests
      await closeNotifications(app)

      t.end()
    })

    t.test("own balance updated", async function(t) {
      await navigate(app, "Wallet")

      // TODO should not be necessary
      await sleep(1000)
      await app.client.$(".material-icons=refresh").click()

      let mycoinEl = () => balanceEl("fermion")
      await waitForText(mycoinEl, (balance - 100).toString(), 10000)
      t.pass("balance is reduced by 100")
      t.end()
    })

    t.end()
  })

  t.test("receive", async function(t) {
    t.test("fermion balance after receiving", async function(t) {
      await restart(app)
      await login(app, "testreceiver")
      await navigate(app, "Wallet")

      let fermionEl = () => balanceEl("fermion")
      await app.client.waitForExist(
        `//span[contains(text(), "Send")]`,
        15 * 1000
      )

      await waitForText(fermionEl, "100", 5000)
      t.pass("received mycoin transaction")
      t.end()
    })

    t.end()
  })

  t.end()
})
