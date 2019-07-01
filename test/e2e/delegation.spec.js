const { actionModalCheckout } = require("./helpers.js")

module.exports = {
  "Delegate Action": async function(browser) {
    // move to according page
    browser.url(browser.launch_url + "/#/staking/validators")

    // move to validator page
    browser.expect.element(".li-validator").to.be.visible.before(10000)
    browser.click(
      ".li-validator[data-moniker=main_account] .data-table__row__info__container__name"
    )

    // open modal and enter amount
    browser.expect.element(`#delegation-btn`).to.be.visible.before(10000)
    browser.click("#delegation-btn")

    const value = "10.42"
    await actionModalCheckout(
      browser,
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
    browser.expect
      .element(".li-tx__content__caption__title")
      .text.to.contain(`Delegated ${value} STAKE`)
      .before(10 * 1000)
  },
  "Redelegate Action": async function(browser) {
    // move to according page
    browser.url(browser.launch_url + "/#/staking/validators")

    // move to validator page
    browser.expect.element(".li-validator").to.be.visible.before(10000)
    browser.click(
      ".li-validator[data-moniker=operator_account_1] .data-table__row__info__container__name"
    )

    // open modal and enter amount
    browser.expect.element(`#delegation-btn`).to.be.visible.before(10000)
    browser.click("#delegation-btn")

    const value = "5.53"
    await actionModalCheckout(
      browser,
      // actions to do on details page
      async () => {
        browser.click("#from")
        browser.click("#from option[value='1']")
        browser.setValue("#amount", value)
        await new Promise(resolve => setTimeout(resolve, 1000))
      },
      // expected subtotal
      value
    )

    // check if tx shows
    browser.url(browser.launch_url + "/#/transactions")
    browser.expect
      .element(".li-tx__content__caption__title")
      .text.to.contain(`Delegated ${value} STAKE`)
      .before(10 * 1000)
  },
  "Undelegate Action": async function(browser) {
    // move to according page
    browser.url(browser.launch_url + "/#/staking/validators")

    // move to validator page
    browser.expect.element(".li-validator").to.be.visible.before(10000)
    browser.click(
      ".li-validator[data-moniker=operator_account_1] .data-table__row__info__container__name"
    )

    // open modal and enter amount
    browser.expect.element(`#undelegation-btn`).to.be.visible.before(10000)
    browser.click("#undelegation-btn")

    const value = "4.2"
    await actionModalCheckout(
      browser,
      // actions to do on details page
      () => {
        browser.setValue("#amount", value)
      },
      // expected subtotal
      "0"
    )

    // check if tx shows
    browser.url(browser.launch_url + "/#/transactions")
    browser.expect
      .element(".li-tx__content__caption__title")
      .text.to.contain(`Undelegated ${value} STAKE`)
      .before(10 * 1000)
  }
}
