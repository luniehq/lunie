module.exports = {
  "Sign in with local account": async function(browser) {
    prepare(browser)

    browser.click("#use-an-existing-address")
    browser.waitForElementVisible("#sign-in-with-account", 10000, true)
    browser.pause(500)
    browser.click("#sign-in-with-account")
    browser.waitForElementVisible("#sign-in-name", 10000, true)
    browser.click(
      "#sign-in-name option[value=cosmos1ek9cd8ewgxg9w5xllq9um0uf4aaxaruvcw4v9e]"
    )
    browser.setValue("#sign-in-password", "1234567890")
    await next(browser)
    // check if signed in
    browser.waitForElementNotPresent(".session", 10000, true)
    openMenu(browser)
    browser.waitForElementVisible("#sign-out", 10000, true)
  },
  "Create local account": async function(browser) {
    prepare(browser)

    browser.click("#create-new-address")

    browser.waitForElementVisible("#sign-up-name", 10000, true)
    await next(browser)
    browser.expect.elements(".tm-form-msg--error").count.to.equal(1)
    browser.setValue("#sign-up-name", "demo-account")
    await next(browser)

    browser.waitForElementVisible("#sign-up-password", 10000, true)
    await next(browser)
    browser.expect.elements(".tm-form-msg--error").count.to.equal(1)
    browser.setValue("#sign-up-password", "1234567890")
    await next(browser)
    browser.setValue("#sign-up-password-confirm", "1234567890")
    await next(browser)

    browser.waitForElementVisible(".seed-table", 10000, true)
    browser.expect
      .element(".seed-table")
      .text.to.match(/(\d+\s+\w+\s+){23}\d+\s+\w+/)
      .before(10000)
    await next(browser)
    browser.expect.elements(".tm-form-msg--error").count.to.equal(1)
    browser.click("#sign-up-warning")
    await next(browser)

    // check if signed in
    browser.waitForElementNotPresent(".session", 10000, true)
    openMenu(browser)
    browser.waitForElementVisible("#sign-out", 10000, true)
  },
  "Import local account": async function(browser) {
    prepare(browser)

    browser.click("#use-an-existing-address")
    browser.waitForElementVisible("#recover-with-backup", 10000, true)
    browser.pause(500)
    browser.click("#recover-with-backup")

    browser.waitForElementVisible("#import-seed", 10000, true)
    await next(browser)
    browser.expect.elements(".tm-form-msg--error").count.to.equal(1)
    browser.setValue(
      "#import-seed",
      `lab stable vessel rose donkey panel slim assault cause tenant level yellow sport argue rural pizza supply idea detect brass shift aunt matrix simple`
    )
    await next(browser)

    browser.waitForElementVisible("#import-name", 10000, true)
    await next(browser)
    browser.expect.elements(".tm-form-msg--error").count.to.equal(1)
    browser.setValue("#import-name", "demo-account-imported")
    await next(browser)

    browser.waitForElementVisible("#import-password", 10000, true)
    await next(browser)
    browser.expect.elements(".tm-form-msg--error").count.to.equal(1)
    browser.setValue("#import-password", "1234567890")
    await next(browser)
    browser.expect.elements(".tm-form-msg--error").count.to.equal(1)
    browser.setValue("#import-password-confirmation", "1234567890")
    await next(browser)

    // check if signed in
    browser.waitForElementNotPresent(".session", 10000, true)
    openMenu(browser)
    browser.waitForElementVisible("#sign-out", 10000, true)
  }
}

async function next(browser) {
  browser.execute(
    function(selector, scrollX, scrollY) {
      var elem = document.querySelector(selector)
      elem.scrollLeft = scrollX
      elem.scrollTop = scrollY
    },
    [".session", 0, 500]
  )
  browser.pause(200)
  return browser.click(".session-footer .button")
}

function openMenu(browser) {
  browser.waitForElementVisible(".open-menu", 10000, true)
  browser.pause(500)
  browser.click(".open-menu")
}

function signOut(browser) {
  openMenu(browser)
  browser.waitForElementVisible("#sign-out", 10000, true)
  browser.click("#sign-out")
}

function signIn(browser) {
  openMenu(browser)
  browser.waitForElementVisible("#sign-in", 10000, true)
  browser.click("#sign-in")
}

function prepare(browser) {
  browser.resizeWindow(400, 1024) // force mobile screen to be able to click some out of screen buttons
  browser.url(browser.launch_url)
  browser.waitForElementVisible(`body`, 10000, true)
  browser.waitForElementVisible(`#app-content`, 10000, true)
  signOut(browser)
  signIn(browser)

  browser.waitForElementVisible("#session-welcome", 10000, true)
}
