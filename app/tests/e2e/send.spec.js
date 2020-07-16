const {
  actionModalCheckout,
  waitForText,
  getLastActivityItemHash,
  waitForHashUpdate,
} = require("./helpers.js")

module.exports = {
  "Send Action": async function (browser) {
    let lastHash = undefined
    // Activity feature is not enabled in polkadot
    if (browser.globals.type !== `polkadot`) {
      // remember the hash of the last transaction
      await browser.url(
        browser.launch_url + browser.globals.slug + "/transactions"
      )
      lastHash = await getLastActivityItemHash(browser)
    }
    await browser.url(browser.launch_url + browser.globals.slug + "/portfolio")
    const amount = 0.01
    await actionModalCheckout(
      browser,
      ".table-cell.actions button",
      // actions to do on details page
      async () => {
        // We send some balance back to master account
        await browser.setValue("#send-address", browser.globals.address)
        await browser.clearValue("#amount")
        await browser.setValue("#amount", amount)
      },
      // expected subtotal
      amount,
      amount,
      amount
    )

    // Activity feature is not enabled in polkadot
    if (browser.globals.type !== `polkadot`) {
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
    }
  },
}
