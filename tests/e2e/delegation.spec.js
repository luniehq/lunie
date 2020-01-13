const { actionModalCheckout, nextBlock, waitForText } = require("./helpers.js")

module.exports = {
  "Delegate Action": async function(browser) {
    // move to according page
    browser.url(browser.launch_url + "/validators", async () => {
      // move to validator page
      browser.expect.element(".li-validator").to.be.visible.before(10000)
      browser.click(".li-validator:nth-of-type(1)")

      const value = browser.globals.stakeAmount
      await actionModalCheckout(
        browser,
        "#delegation-btn",
        // actions to do on details page
        () => {
          browser.setValue("#amount", value)
        },
        value,
        0,
        value
      )
      await nextBlock(browser)

      // check if tx shows
      browser.url(browser.launch_url + "/transactions")
      await waitForText(
        browser,
        ".tx:nth-of-type(1) .tx__content .tx__content__left",
        `Staked`
      )
      await waitForText(
        browser,
        ".tx:nth-of-type(1) .tx__content .tx__content__right .amount",
        `${value} ${browser.globals.denom}`
      )
    })
  },
  /*
  "Redelegate Action": async function(browser) {
    // move to according page
    browser.url(browser.launch_url + "/validators", async () => {
      // move to validator page
      browser.expect.element(".li-validator").to.be.visible.before(10000)
      browser.click(".li-validator:nth-of-type(2)")


      const value = browser.globals.restakeAmount
      await actionModalCheckout(
        browser,
        "#delegation-btn",
        // actions to do on details page
        () => {
          setSelect(browser, "#from select", "1")
          browser.expect
            .element(".action-modal-title")
            .text.to.contain(`Restake`)
            .before(2000)
          browser.setValue("#amount", value)
        },
        // expected subtotal
        value,
        0,
        value
      )

      await nextBlock(browser)

      // check if tx shows
      browser.url(browser.launch_url + "/transactions")

      await waitForText(
        browser,
        ".tx:nth-of-type(1) .tx__content .tx__content__left",
        `Restaked`
      )
      await waitForText(
        browser,
        ".tx:nth-of-type(1) .tx__content .tx__content__right .amount",
        `${value} ${browser.globals.denom}`
      )
    })
  },
  */
  "Undelegate Action": async function(browser) {
    // be sure that the balance has updated, if we don't wait, the baseline (balance) shifts
    await nextBlock(browser)

    // move to according page
    browser.url(browser.launch_url + "/validators")

    // move to validator page
    browser.expect.element(".li-validator").to.be.visible.before(10000)
    browser.click(".li-validator:nth-of-type(2)")

    const value = browser.globals.stakeAmount
    await actionModalCheckout(
      browser,
      "#undelegation-btn",
      // actions to do on details page
      () => {
        browser.setValue("#amount", value)
      },
      // expected subtotal
      "0"
    )

    await nextBlock(browser)

    // check if tx shows
    browser.url(browser.launch_url + "/transactions")

    await waitForText(
      browser,
      ".tx:nth-of-type(1) .tx__content .tx__content__left",
      `Unstaked`,
      10,
      2000
    )
    await waitForText(
      browser,
      ".tx:nth-of-type(1) .tx__content .tx__content__right .amount",
      `${value} ${browser.globals.denom}`
    )
  }
}
/*
function setSelect(browser, selector, option) {
  browser.execute(
    function(selector, option) {
      const select = document.querySelector(selector)
      select.value = option

      // Create a new 'change' event
      var event = new Event("input")

      // Dispatch it.
      select.dispatchEvent(event)
    },
    [selector, option]
  )
}
*/
