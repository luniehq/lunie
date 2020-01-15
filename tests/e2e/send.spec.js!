const { actionModalCheckout, nextBlock, waitForText } = require("./helpers.js")

module.exports = {
  "Send Action": async function(browser) {
    // move to according page
    browser.url(browser.launch_url + "/portfolio", async () => {
      browser.click(".modal-tutorial .close")
      actionModalCheckout(
        browser,
        ".send-button",
        // actions to do on details page
        () => {
          browser.setValue(
            "#send-address",
            "cosmos1uczvuwljkqvvd3mhdk80t6jefskccmjxwyh70k"
          )
          browser.clearValue("#amount")
          browser.setValue("#amount", "0.00001")
        },
        // expected subtotal
        "0.00001"
      )
      await nextBlock(browser)
      // check if tx shows
      browser.url(browser.launch_url + "/transactions")
      browser.pause(1000)
      await waitForText(
        browser,
        ".tx:nth-of-type(1) .tx__content .tx__content__left",
        "Sent"
      )
      await waitForText(
        browser,
        ".tx:nth-of-type(1) .tx__content .tx__content__right",
        `0.00001 ${browser.globals.denom}`
      )
    })
  }
}
