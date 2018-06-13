let { spawn } = require("child_process")
let test = require("tape-promise/tape")
let { getApp, restart } = require("./launch.js")
let {
  navigateToPreferences,
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
    await navigateToPreferences(app) //should click preferences link with username

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
      await app.client.waitForVisible(".ni-session-wrapper", 5000)

      await login(app, "default")
      await navigateToPreferences(app) //should click preferences link with username

      await sleep(1000)
      let network = await app.client
        .$("#ni-connected-network__string")
        .getHTML()
      t.ok(
        network.indexOf("mock-chain") !== -1,
        "network indicator shows 'mock-chain'"
      )

      t.end()
    })

    t.end()
  })

  t.end()
})
