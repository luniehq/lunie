const { actionModalCheckout, nextBlock, waitForText } = require("./helpers.js")

module.exports = {
  "Validator Search": async function(browser) {
    // move to according page
    browser.url(browser.launch_url + "#/validators")

    // browser.expect.element(".li-validator").to.be.visible.before(10000)
    browser.expect
      .elements(".li-validator")
      .count.not.to.equal(0)
      .before(10000)

    // names of the validators operator_account_1, operator_account_2, main_account

    // negative test
    browser.expect.element(".li-validator[data-name=main_account]").to.be
      .visible

    browser.expect.element(".searchField").to.be.visible
    browser.setValue(".searchField", "operator_account")

    browser.expect
      .elements(".li-validator")
      .count.not.to.equal(0)
      .before(10000)
    // our current testnet always kills one of the operators, we don't know which
    // let's fix that and then reenable this check
    // browser.expect
    //   .element(".li-validator[data-name=operator_account_1]")
    //   .to.be.visible.before(10000)
    browser.expect
      .elements(".li-validator[data-name=main_account]")
      .count.to.equal(0) // fix to use "not there"
      .before(10000)
  }
}
