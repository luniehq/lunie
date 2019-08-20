const { actionModalCheckout, nextBlock } = require("./helpers.js")

module.exports = {
  "Delegate Action": async function(browser) {
    // move to according page
    browser.url(browser.launch_url + "/#/validators")

    // move to validator page
    browser.expect.element(".li-validator").to.be.visible.before(10000)
    browser.click(".li-validator[data-moniker=main_account]")

    const value = "10.42"
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

    // check if tx shows
    browser.url(browser.launch_url + "/#/transactions")
    browser.pause(500)
    browser.expect
      .element(".tx__content__caption")
      .text.to.contain(`Delegated ${value} STAKE`)
  },
  "Redelegate Action": async function(browser) {
    // move to according page
    browser.url(browser.launch_url + "/#/validators")

    // move to validator page
    browser.expect.element(".li-validator").to.be.visible.before(10000)
    browser.click(".li-validator[data-moniker=operator_account_1]")

    const value = "5.53"
    await actionModalCheckout(
      browser,
      "#delegation-btn",
      // actions to do on details page
      () => {
        setSelect(browser, "#from select", "1")
        browser.expect
          .element(".action-modal-title")
          .text.to.contain(`Redelegate`)
          .before(2000)
        browser.setValue("#amount", value)
      },
      // expected subtotal
      "0"
    )

    // check if tx shows
    browser.url(browser.launch_url + "/#/transactions")
    browser.pause(500)
    browser.expect
      .element(".tx__content__caption")
      .text.to.contain(`Redelegated ${value} STAKE`)
  },
  "Undelegate Action": async function(browser) {
    // be sure that the balance has updated, if we don't wait, the baseline (balance) shifts
    await nextBlock(browser)

    // move to according page
    browser.url(browser.launch_url + "/#/validators")

    // move to validator page
    browser.expect.element(".li-validator").to.be.visible.before(10000)
    browser.click(".li-validator[data-moniker=operator_account_1]")

    const value = "4.2"
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

    // check if tx shows
    browser.url(browser.launch_url + "/#/transactions")
    browser.pause(500)
    browser.expect
      .element(".tx__content__caption")
      .text.to.contain(`Undelegated ${value} STAKE`)
  }
}

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
