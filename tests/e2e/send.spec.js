const {
  actionModalCheckout,
  waitForText,
  getLastActivityItemHash,
  waitForHashUpdate,
} = require("./helpers.js")

module.exports = {
  "Send Action": async function (browser) {
    // remember the hash of the last transaction
    await browser.url(
      browser.launch_url + browser.globals.slug + "/transactions"
    )
    const lastHash = await getLastActivityItemHash(browser)
    await browser.url(browser.launch_url + browser.globals.slug + "/portfolio")
    const amount = 0.01
    await actionModalCheckout(
      browser,
      ".circle-send-button",
      // actions to do on details page
      async () => {
        await browser.setValue("#send-address", browser.globals.address)
        await browser.clearValue("#amount")
        await browser.setValue("#amount", amount)
      },
      // expected subtotal
      amount,
      amount,
      amount
    )
    // check if the hash is changed
    await browser.url(
      browser.launch_url + browser.globals.slug + "/transactions"
    )
    // check if tx shows
    await waitForText(
      browser,
      ".tx:nth-of-type(1) .tx__content .tx__content__left h3",
      "Received"
    )
    await waitForText(
      browser,
      ".tx:nth-of-type(1) .tx__content .tx__content__right",
      `${amount} ${browser.globals.denom}`
    )

    await waitForHashUpdate(browser, lastHash)
  },
}
