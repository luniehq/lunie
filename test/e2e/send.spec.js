const { expect } = require("chai")

module.exports = {
  "Send Action": async function(browser) {
    browser
      .url(browser.launch_url + "/#/wallet")
      .waitForElementVisible(`body`)
      .waitForElementVisible(`#app-content`)
    const balanceBefore = await getBalance(browser)
    console.log(balanceBefore)
    browser
      .waitForElementVisible(`.li-coin:first-child`)
      .click(".li-coin:first-child button")
      .waitForElementVisible(`#send-modal`)
      .setValue(
        "#send-address",
        "cosmos1v9zf9klj57rfsmdyamza5jqh9p46m3dlvq847j"
      )
      .setValue("#amount", "1.3")
      .click(".action-modal-footer .tm-btn")
      .waitForElementVisible(`.table-invoice`)
    browser.expect
      .element(".table-invoice li:first-child span:last-child")
      .text.to.contain("1.3")
    browser
      .click(".action-modal-footer .tm-btn")
      .setValue("#password", "1234567890")
      .click(".action-modal-footer .tm-btn")
    browser.waitForElementNotVisible(`#send-modal`)
    await waitFor(async () => {
      expect(await getBalance(browser)).to.be.lessThan(balanceBefore)
    })
  }
}

async function getBalance(browser) {
  return await new Promise(resolve => {
    // wait for balance to show
    browser
      .waitForElementVisible(`.total-atoms__value`)
      .expect.element(".total-atoms__value")
      .text.not.to.contain("--")
      .before(10 * 1000)
    browser.getText(".total-atoms__value", ({ value }) =>
      resolve(Number(value))
    )
  })
}

async function waitFor(fn, totalTimeout = 10 * 1000, timeout = 1000) {
  const startTime = Date.now()
  while (Date.now() - startTime < totalTimeout) {
    try {
      await fn()
      return
    } catch (err) {
      console.error(err)
      await new Promise(resolve => setTimeout(resolve, timeout))
    }
  }

  throw new Error("Condition was not meet in time")
}
