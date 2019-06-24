module.exports = {
  "Sign in with local account": async function(browser) {
    browser.url(browser.launch_url + "?insecure=true")
    browser.waitForElementVisible(`body`)
    browser.waitForElementVisible(`#app-content`)
    browser
      // we are by default signed in so we first need to sign out
      .waitForElementVisible("#signOut-btn")
    browser.click("#signOut-btn")
    // sign in
    browser.waitForElementVisible(".sign-in-button")
    browser.pause(1000) // if not waiting here, the session modal closes immediatly // TODO
    browser.click(".sign-in-button")
    browser.waitForElementVisible("#session-welcome")
    browser.click("#use-an-existing-address")
    browser.waitForElementVisible("#session-existing")
    browser.click("#sign-in-with-account")
    browser.waitForElementVisible("#sign-in-name")
    browser.click("#sign-in-name option[value=rich_account]")
    browser.setValue("#sign-in-password", "1234567890")
    browser.click(".session-footer button")
    browser.waitForElementVisible("#signOut-btn")
  },
  "Create local account": async function(browser) {
    browser.url(browser.launch_url + "?insecure=true")
    browser.waitForElementVisible(`body`)
    browser.waitForElementVisible(`#app-content`)
    // we are by default signed in so we first need to sign out
    browser.waitForElementVisible("#signOut-btn")
    browser.click("#signOut-btn")
    // sign in
    browser.waitForElementVisible(".sign-in-button")
    browser.pause(1000) // if not waiting here, the session modal closes immediatly // TODO
    browser.click(".sign-in-button")
    browser.waitForElementVisible("#session-welcome")
    browser.click("#creat-new-address")
    browser.waitForElementVisible("#sign-up-seed")
    browser.expect
      .element("#sign-up-seed")
      .value.to.match(/\w+( \w+){23}/)
      .before(10000)

    next(browser)
    browser.expect.elements(".tm-form-msg--error").count.to.equal(4)

    browser.setValue("#sign-up-name", "demo-account")
    next(browser)
    browser.expect.elements(".tm-form-msg--error").count.to.equal(3)

    browser.setValue("#sign-up-password", "1234567890")
    next(browser)
    browser.expect
      .elements(".tm-form-msg--error")
      // the error on the initial password vanishes but the password confirmation appears
      .count.to.equal(3)

    browser.setValue("#sign-up-password-confirm", "1234567890")
    next(browser)
    browser.expect.elements(".tm-form-msg--error").count.to.equal(2)

    browser.setValue("#sign-up-warning", true)
    next(browser)
    // signs in
    browser.waitForElementVisible("#signOut-btn")
  }
}

function next(browser) {
  return browser.click(".session-footer button")
}
