const { actionModalCheckout } = require("./helpers.js")

module.exports = {
  "Send Action": async function(browser) {
    // move to according page
    browser.url(browser.launch_url + "/#/portfolio")

    // open modal and enter amount
    browser.expect.element(`.send-button`).to.be.visible.before(10000)
    browser.click(".send-button")
    browser.expect.element(`#send-modal`).to.be.visible.before(10000)

    actionModalCheckout(
      browser,
      // actions to do on details page
      () => {
        browser.setValue(
          "#send-address",
          "cosmos1v9zf9klj57rfsmdyamza5jqh9p46m3dlvq847j"
        )
        browser.setValue("#amount", "1.3")
      },
      // expected subtotal
      "1.3"
    )

    // check if tx shows
    browser.url(browser.launch_url + "/#/transactions")
    browser.expect
      .element(".li-tx__content__caption__title")
      .text.to.contain("Sent 1.3 STAKE")
      .before(10 * 1000)
  }
}
