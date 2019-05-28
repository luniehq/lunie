const { actionModalCheckout } = require("./helpers.js")

module.exports = {
  "Delegate Action": async function(browser) {
    // move to according page
    browser.url(browser.launch_url + "/#/staking/validators")

    // move to validator page
    browser
      .waitForElementVisible(".li-validator")
      .click(
        ".li-validator[data-moniker=main_account] .data-table__row__info__container__name"
      )

    // open modal and enter amount
    browser.waitForElementVisible(`#delegation-btn`).click("#delegation-btn")

    const value = "1.42"
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
    browser
      .url(browser.launch_url + "/#/transactions")
      .expect.element(".li-tx__content__caption__title")
      .text.to.contain(`Delegated ${value} STAKE`)
      .before(10 * 1000)
  },
  "Redelegate Action": async function(browser) {
    // move to according page
    browser.url(browser.launch_url + "/#/staking/validators")

    // move to validator page
    browser
      .waitForElementVisible(".li-validator")
      .click(
        ".li-validator[data-moniker=operator_account_1] .data-table__row__info__container__name"
      )

    // open modal and enter amount
    browser.waitForElementVisible(`#delegation-btn`).click("#delegation-btn")

    const value = "1.53"
    await actionModalCheckout(
      browser,
      // actions to do on details page
      () => {
        browser.click("#from option[value='1']").setValue("#amount", value)
      },
      // expected subtotal
      value
    )

    // check if tx shows
    browser
      .url(browser.launch_url + "/#/transactions")
      .expect.element(".li-tx__content__caption__title")
      .text.to.contain(`Delegated ${value} STAKE`)
      .before(10 * 1000)
  },
  "Undelegate Action": async function(browser) {
    // move to according page
    browser.url(browser.launch_url + "/#/staking/validators")

    // move to validator page
    browser
      .waitForElementVisible(".li-validator")
      .click(
        ".li-validator[data-moniker=operator_account_1] .data-table__row__info__container__name"
      )

    // open modal and enter amount
    browser
      .waitForElementVisible(`#undelegation-btn`)
      .click("#undelegation-btn")

    await actionModalCheckout(
      browser,
      // actions to do on details page
      () => {
        browser.setValue("#amount", "0.2")
      },
      // expected subtotal
      "0"
    )

    // check if tx shows
    browser
      .url(browser.launch_url + "/#/transactions")
      .expect.element(".li-tx__content__caption__title")
      .text.to.contain("Undelegated 0.2 STAKE")
      .before(10 * 1000)
  }
}
