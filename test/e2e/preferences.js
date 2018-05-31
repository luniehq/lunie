let { spawn } = require("child_process")
let test = require("tape-promise/tape")
let { getApp, restart } = require("./launch.js")
let {
  navigate,
  newTempDir,
  waitForText,
  sleep,
  login,
  selectOption,
  closeNotifications
} = require("./common.js")

/*
* NOTE: don't use a global `let client = app.client` as the client object changes when restarting the app
*/

test("preferences", async function(t) {
  let { app, home } = await getApp(t)
  await restart(app)

  let $ = (...args) => app.client.$(...args)

  await login(app, "testkey")

  t.test("change", async function(t) {
    await navigate(app, "testkey", "Preferences") //should click preferences link with username

    let networkSelect = () => $("#select-network select")
    let themeSelect = () => $("#select-theme select")
    let tutorialBtn = () => $("#toggle-onboarding")
    let statisticsToggle = () => $("label.ni-toggle")

    t.test("default network", async function(t) {
      let option = await networkSelect().getValue()
      t.equal(option.toString(), "live", "Live Testnet is correct")
      t.end()
    })
    t.test("mock network", async function(t) {
      await selectOption(app, "#select-network select", "mock")
      // await networkSelect().selectByVisibleText("Mock Testnet")
      await sleep(1000)

      // await login(app, "default")
      // HACK skipping actual login verification
      await app.client.waitForExist("#sign-in-name", 10000)
      await app.client.$(".ni-session-footer button").click()
      await app.client.waitForExist("#app-content", 10000)

      await navigate(app, "default", "Preferences") //should click preferences link with username

      await sleep(1000)
      let network = await $(
        "#app-content .ni-connectivity .ni-li-title"
      ).getText()
      console.log("network", network)
      console.log(network.split(" "))
      t.equal(network.split(" ")[0], "mock-chain", "Mock Chain Working")

      t.end()
    })

    t.end()
  })

  t.end()
})
