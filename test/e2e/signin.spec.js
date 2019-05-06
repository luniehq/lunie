module.exports = {
  url: `http://localhost:8081`,
  "Sign in": function(browser) {
    browser
      .url(browser.launch_url + "?insecure=true")
      .waitForElementVisible(`body`)
      .waitForElementVisible(`#app-content`)
      .click(".sign-in-button")
      .waitForElementVisible("#session-welcome")
      .click("#sign-in-with-account")
      .waitForElementVisible("#sign-in-name")
      .click("#sign-in-name option[value=rich_account]")
      .setValue("#sign-in-password", "1234567890")
      .click(".tm-session-footer button")
      .waitForElementVisible("#signOut-btn")
      .end()
  }
}
