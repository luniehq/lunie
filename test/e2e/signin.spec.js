module.exports = {
  "Sign in with local account": async function(browser) {
    prepare(browser)

    browser.click("#use-an-existing-address")
    browser.waitForElementVisible("#session-existing")
    browser.click("#sign-in-with-account")
    browser.waitForElementVisible("#sign-in-name")
    browser.click(
      "#sign-in-name option[value=cosmos1ek9cd8ewgxg9w5xllq9um0uf4aaxaruvcw4v9e]"
    )
    browser.setValue("#sign-in-password", "1234567890")
    browser.click(".session-footer button")
    openMenu(browser)
    browser.waitForElementVisible("#mobile-sign-out")
  },
  "Create local account": async function(browser) {
    prepare(browser)

    browser.click("#creat-new-address")
    browser.waitForElementVisible("#sign-up-seed")
    browser.expect
      .element("#sign-up-seed")
      .value.to.match(/\w+( \w+){23}/)
      .before(10000)

    await next(browser)
    browser.expect.elements(".tm-form-msg--error").count.to.equal(4)

    browser.setValue("#sign-up-name", "demo-account")
    await next(browser)
    browser.expect.elements(".tm-form-msg--error").count.to.equal(3)

    browser.setValue("#sign-up-password", "1234567890")
    await next(browser)
    browser.expect
      .elements(".tm-form-msg--error")
      // the error on the initial password vanishes but the password confirmation appears
      .count.to.equal(3)

    browser.setValue("#sign-up-password-confirm", "1234567890")
    await next(browser)
    browser.expect.elements(".tm-form-msg--error").count.to.equal(2)

    browser.click("#sign-up-warning")
    await next(browser)
    // signs in
    openMenu(browser)
    browser.waitForElementVisible("#mobile-sign-out")
  },
  "Import local account": async function(browser) {
    prepare(browser)

    browser.click("#use-an-existing-address")
    browser.click("#recover-with-backup")
    browser.waitForElementVisible("#import-seed")

    await next(browser)
    browser.expect.elements(".tm-form-msg--error").count.to.equal(3)

    browser.setValue("#import-name", "demo-account-imported")
    await next(browser)
    browser.expect.elements(".tm-form-msg--error").count.to.equal(2)

    browser.setValue("#import-password", "1234567890")
    await next(browser)
    browser.expect
      .elements(".tm-form-msg--error")
      // the error on the initial password vanishes but the password confirmation appears
      .count.to.equal(2)

    browser.setValue("#import-password-confirmation", "1234567890")
    await next(browser)
    browser.expect.elements(".tm-form-msg--error").count.to.equal(1)

    browser.setValue(
      "#import-seed",
      `lab stable vessel rose donkey panel slim assault cause tenant level yellow sport argue rural pizza supply idea detect brass shift aunt matrix simple`
    )
    await next(browser)
    // signs in
    openMenu(browser)
    browser.waitForElementVisible("#mobile-sign-out")
  }
}

async function next(browser) {
  browser.execute(
    function(selector, scrollX, scrollY) {
      var elem = document.querySelector(selector)
      elem.scrollLeft = scrollX
      elem.scrollTop = scrollY
    },
    [".session", 0, 300]
  )
  return browser.click(".session-footer .tm-btn")
}

function openMenu(browser) {
  browser.click(".open-menu")
}

function signOut(browser) {
  openMenu(browser)
  browser.waitForElementVisible("#mobile-sign-out")
  browser.click("#mobile-sign-out")
}

function signIn(browser) {
  openMenu(browser)
  browser.waitForElementVisible("#mobile-sign-in")
  browser.click("#mobile-sign-in")
}

function prepare(browser) {
  browser.resizeWindow(400, 1024) // force mobile screen to be able to click some out of screen buttons
  browser.url(browser.launch_url + "?insecure=true")
  browser.waitForElementVisible(`body`)
  browser.waitForElementVisible(`#app-content`)
  signOut(browser)
  signIn(browser)

  browser.waitForElementVisible("#session-welcome")
}
