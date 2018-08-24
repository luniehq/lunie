let test = require("tape-promise/tape")
let fs = require("fs-extra")
let { getApp, startApp, stop } = require("./launch.js")

// tests for initialization and failover over the application as well as handling of configuration files
test("initialization", async function(t) {
  let { app, cliHome, setupAccounts } = await getApp(t)

  t.test("survive config folder mess up", async function(t) {
    // TODO: uncomment below once we restore initting

    // accept node hash
    // await app.client.$("#tm-modal-lcd-approval__btn-approve").click()
    // await app.client.waitForExist(
    //   ".tm-session-title=Sign in to Cosmos Voyager",
    //   5000
    // )

    // test if app restores from unitialized gaia folder
    await stop(app)
    fs.removeSync(cliHome)
    await startApp(app)
    t.ok(app.isRunning(), "app recovers from uninitialized gaia")

    // accept node hash
    // await app.client.$("#tm-modal-lcd-approval__btn-approve").click()
    // await app.client.waitForExist(
    //   ".tm-session-title=Sign in to Cosmos Voyager",
    //   5000
    // )
    // console.log("approved hash")

    await stop(app)

    // we are prior removing the config folder with the keys so we need to restore the default state
    await setupAccounts()

    t.end()
  })
})
