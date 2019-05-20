module.exports = {
  url: `http://localhost:8081/#/wallet`,
  "Send Action": async function(browser) {
    browser
      .url(browser.launch_url)
      .waitForElementVisible(`body`)
      .waitForElementVisible(`#app-content`)
    // TODO get balance
    browser
      .waitForElementVisible(`.li-coin:first-child`)
      .click(".li-coin:first-child")
      .waitForElementVisible(`#send-modal`)
      .setValue("#send-address", "cosmos1v9zf9klj57rfsmdyamza5jqh9p46m3dlvq847j")
      .setValue("#amount", "1.3")
      .click(".action-modal-footer .tm-btn")
      .waitForElementVisible(`.table-invoice`)
    browser
      .expect
      .element(".table-invoice li:first-child span:last-child")
      .text.to.contain("1,3")
    browser
      .click(".action-modal-footer .tm-btn")
      .setValue("#password", "1234567890")
      .click(".action-modal-footer .tm-btn")
    browser
      .waitForElementVisible(`#send-modal`)
    // TODO check balance update
  }
}
