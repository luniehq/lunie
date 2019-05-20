module.exports = {
  url: `http://localhost:8081`,
  "Network Overview": async function(browser) {
    browser
      .url(browser.launch_url)
      .waitForElementVisible(`body`)
      .waitForElementVisible(`#app-content`)
    browser.expect
      .element(".page-profile__title")
      .text.to.contain("testnet")
      .before(10 * 1000)
  }
}
