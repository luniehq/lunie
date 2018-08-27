function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/*
* NOTE: don't use a global `let client = app.client` and don't pass around the client as the client object changes when restarting the app. Always use `app.client`.
*/

module.exports = {
  async closeNotifications(app) {
    // close notifications as they overlay the menu button
    await sleep(100)
    while (await app.client.isExisting(`.tm-notification`)) {
      await app.client.$(`.tm-notification`).click()
      await sleep(100)
    }
  },
  async openMenu(app) {
    console.log("opening menu")
    if (await app.client.isExisting(".app-menu")) {
      return
    }
    await module.exports.closeNotifications(app)
    await app.client.waitForExist(".material-icons=menu", 1000)
    await sleep(100)
    await app.client.$(".material-icons=menu").click()
    await app.client.waitForExist(".app-menu", 1000)
  },
  async closeMenu(app) {
    console.log("closing menu")
    // the menu is always open on desktop
    if (!(await app.client.isExisting("#app-header.mobile"))) {
      return
    }
    // check if menu is actually open
    if (!(await app.client.isExisting(".app-menu"))) {
      return
    }
    // close notifications that could block the click
    await module.exports.closeNotifications(app)
    await app.client.waitForExist(".material-icons=close", 1000)
    await sleep(100)
    await app.client.$(".material-icons=close").click()
    await app.client.waitForExist(".app-menu", 1000, true)
    console.log("closed menu")
  },
  async navigate(app, linkText, titleText = linkText) {
    await module.exports.openMenu(app)
    // click link
    await app.client.$(`a*=${linkText}`).click()
    await app.client.waitUntilTextExists(".tm-page-header-title", titleText)
    console.log(`navigated to "${linkText}"`)
  },
  async navigateToPreferences(app) {
    await module.exports.openMenu(app)
    // click link
    await app.client.$(`.tm-li-user`).click()
    console.log(`navigated to preferences`)
  },
  sleep,
  async waitForText(elGetterFn, text, timeout = 5000) {
    let start = Date.now()
    while ((await elGetterFn().getText()) !== text) {
      if (Date.now() - start >= timeout) {
        throw Error(
          `Timed out waiting for text. Expected ${text}, Showing ${(await elGetterFn().getText()) ||
            "nothing"}`
        )
      }
      await sleep(100)
    }
  },
  async waitForValue(elGetterFn, value, timeout = 5000) {
    let start = Date.now()
    while ((await elGetterFn().getValue()) !== value) {
      if (Date.now() - start >= timeout) {
        throw Error(
          `Timed out waiting for value. Expected ${value}, Showing ${(await elGetterFn().getValue()) ||
            "nothing"}`
        )
      }
      await sleep(100)
    }
  },
  async login(app, account = "default") {
    console.log("logging into " + account)
    let accountsSelect = "#sign-in-name select"

    await app.client.waitForExist(accountsSelect, 10000)

    // in mocked mode, the password is already set and selectOption presses enter resulting in logging, which we don't want to keep the process the same as in live mode
    await app.client.$("#sign-in-password").click()
    await app.client.keys(["___"])

    await module.exports.selectOption(app, accountsSelect, account)

    await app.client.$("#sign-in-password").setValue("1234567890")
    await app.client.$(".tm-session-footer button").click()

    await app.client.waitForExist("#app-content", 10000)

    // checking if user is logged in
    await module.exports.openMenu(app)
    let activeUser = await app.client.$(".tm-li-user .tm-li-subtitle").getText()
    if (account !== activeUser) {
      throw new Error(
        "Incorrect user logged in (" + account + ", " + activeUser + ")"
      )
    }

    console.log("logged in")

    await module.exports.closeMenu(app)
  },
  async logout(app) {
    console.log("logging out")
    if (await app.client.isExisting(".tm-li-session")) {
      return
    }
    await module.exports.openMenu(app)

    await app.client.$(".tm-li-user").click()
    await sleep(300)
    await app.client
      .$(".material-icons=exit_to_app")
      .$("..")
      .click()
  },
  async selectOption(app, selectSelector, text) {
    await app.client.$(selectSelector).click()
    for (let letter of text.split()) {
      if ((await app.client.$(selectSelector).getValue()) === text) break
      await app.client.keys(letter)
    }
    await app.client.keys("Enter")
  }
}
