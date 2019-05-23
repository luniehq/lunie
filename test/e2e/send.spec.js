const numeral = require("numeral")
const { getBalance, awaitBalance } = require("./helpers.js")

module.exports = {
  "Send Action": async function(browser) {
    // move to according page
    browser.url(browser.launch_url + "/#/wallet")

    // remember balance to compare later if send got through
    browser
      .waitForElementVisible(`.total-atoms__value`)
      .expect.element(".total-atoms__value")
      .text.not.to.contain("--")
      .before(10 * 1000)
    const balanceBefore = await getBalance(browser)

    // open modal and enter amount
    browser
      .waitForElementVisible(`#li-coin--stake`)
      .click("#li-coin--stake button")
      .waitForElementVisible(`#send-modal`)
      .setValue(
        "#send-address",
        "cosmos1v9zf9klj57rfsmdyamza5jqh9p46m3dlvq847j"
      )
      .setValue("#amount", "1.3")
      .click(".action-modal-footer .tm-btn")
      .waitForElementVisible(`.table-invoice`)

    // check invoice
    browser.expect
      .element(".table-invoice li:first-child span:last-child")
      .text.to.contain("1.3")

    // remember fees
    const fees = await new Promise(resolve =>
      browser.getText(
        ".table-invoice li:nth-child(2) span:last-child",
        ({ value }) => resolve(numeral(value).value())
      )
    )

    // submit
    browser
      .click(".action-modal-footer .tm-btn")
      .setValue("#password", "1234567890")
      .click(".action-modal-footer .tm-btn")

    browser.expect.element("#send-modal").not.to.be.present.before(10 * 1000)

    // check if balance header updates
    await awaitBalance(browser, balanceBefore - 1.3 - fees)

    // check if tx shows
    browser
      .url(browser.launch_url + "/#/transactions")
      .expect.element(".li-tx__content__caption__title")
      .text.to.contain("Sent 1.3 STAKE")
      .before(10 * 1000)
  }
}
