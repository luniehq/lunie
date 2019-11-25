const { actionModalCheckout, nextBlock, waitForText } = require("./helpers.js")

module.exports = {
  "Send Action": async function(browser) {
    // move to according page
    browser.url(browser.launch_url + "#/portfolio")

    actionModalCheckout(
      browser,
      ".send-button",
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

    await nextBlock(browser)

    // check if tx shows
    browser.url(browser.launch_url + "/#/transactions")
    browser.pause(1000)
    await waitForText(
      browser,
      ".tx:nth-child(2) .tx-caption .tx__content .tx__content__left",
      "Sent 1.3 STAKE"
    )
    await waitForText(
      browser,
      ".tx:nth-child(2) .tx-caption .tx__content .tx__content__right",
      "1.3 STAKE"
    )
  }
}
