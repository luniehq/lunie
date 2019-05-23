module.exports = {
  "Sign in with local account": async function(browser) {
    browser
      .url(browser.launch_url + "?insecure=true")
      .waitForElementVisible(`body`)
      .waitForElementVisible(`#app-content`)
      // we are by default signed in so we first need to sign out
      .waitForElementVisible("#signOut-btn")
      .click("#signOut-btn")
      // sign in
      .waitForElementVisible(".sign-in-button")
      .click(".sign-in-button")
      .waitForElementVisible("#session-welcome")
      .click("#sign-in-with-account")
      .waitForElementVisible("#sign-in-name")
      .click("#sign-in-name option[value=rich_account]")
      .setValue("#sign-in-password", "1234567890")
      .click(".tm-session-footer button")
      .waitForElementVisible("#signOut-btn")
  }
}
