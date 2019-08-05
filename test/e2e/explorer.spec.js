module.exports = {
  url: `http://localhost:8081`,
  "Network Overview": async function(browser) {
    browser.url(browser.launch_url)
    browser.expect.element(`body`).to.be.visible.before(10000)
    browser.expect.element(`#app-content`).to.be.visible.before(10000)
    browser.expect
      .element(".page-profile__title")
      .text.to.contain("testnet")
      .before(10 * 1000)
  }
}
