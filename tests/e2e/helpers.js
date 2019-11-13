const numeral = require("numeral")
const { expect } = require("chai")

async function getBalance(browser) {
  return new Promise(resolve => {
    browser.expect.element(`.total-atoms__value`).to.be.visible.before(10000)
    browser.getText(".total-atoms__value", ({ value }) => {
      resolve(numeral(value).value())
    })
  })
}
async function getAvailableTokens(browser) {
  return new Promise(resolve => {
    browser.expect.element(`.available-atoms`).to.be.visible.before(10000)
    browser.getText(".available-atoms", ({ value }) => {
      resolve(numeral(value).value())
    })
  })
}
async function awaitBalance(browser, balance) {
  await waitFor(async () => {
    expect(String(balance)).to.startsWith(String(await getBalance(browser)))
  })
  console.log(`√ Balance is ${balance}`)
}
async function waitFor(check, iterations = 10, timeout = 1000) {
  while (--iterations) {
    try {
      await check()
      return
    } catch (err) {
      console.error(err.message)
      await new Promise(resolve => setTimeout(resolve, timeout))
    }
  }

  console.error("Condition was not meet in time")
  process.exit(2) // exiting here so the e2e tests actually fail. if not they pass
}
async function waitForText(
  browser,
  selector,
  expectedCaption,
  iterations,
  timeout
) {
  await waitFor(
    async () => {
      const { value: caption } = await browser.getText(selector)
      expect(caption).to.include(expectedCaption)
    },
    iterations,
    timeout
  )
}

// performs some details actions and handles checking of the invoice step + signing
async function actionModalCheckout(
  browser,
  btnSelector,
  detailsActionFn,
  expectedSubtotal,
  expectedTotalChange = 0,
  expectedAvailableTokensChange = 0
) {
  // grab page we came from as we want to go to another page and come back
  let sourcePage
  browser.url(function(result) {
    sourcePage = result.value
  })

  // go to portfolio to remember balances
  browser.url(browser.launch_url + "#/portfolio")

  // remember balance to compare later if send got through
  browser.expect.element(`.total-atoms__value`).to.be.visible.before(10000)
  browser.expect
    .element(".total-atoms__value")
    .text.not.to.contain("--")
    .before(10 * 1000)
  const balanceBefore = await getBalance(browser)
  const availableTokensBefore = await getAvailableTokens(browser)

  // go back to source page to checkout
  browser.url(sourcePage)

  browser.pause(500)

  // open modal and enter amount
  browser.expect.element(btnSelector).to.be.visible.before(10000)
  browser.click(btnSelector)

  browser.expect.element(".action-modal").to.be.visible.before(10000)

  browser.pause(500)

  await detailsActionFn()

  // proceed to invoice step
  browser.click(".action-modal-footer .button")
  browser.expect.element(`.table-invoice`).to.be.visible.before(10000)

  // check invoice
  if (expectedSubtotal === "0") {
    // doesn't show sub total
    browser.expect.elements(".table-invoice li").count.to.equal(2)
  } else {
    browser.expect
      .element(".table-invoice li:first-child span:last-child")
      .text.to.contain(expectedSubtotal)
  }

  // remember fees
  const fees = await new Promise(resolve =>
    browser.getText(
      ".table-invoice li:nth-child(2) span:last-child",
      ({ value }) => resolve(numeral(value).value())
    )
  )

  // await next block to be sure about the sequence number
  // TODO needs to be fixed and put into cosmos-api
  // await nextBlock(browser)

  // submit
  browser.click(".action-modal-footer .button")
  browser.setValue("#password", "1234567890")
  browser.click(".action-modal-footer .button")

  browser.expect.element(".success-step").to.be.present.before(20 * 1000)
  browser.click("#closeBtn")

  // go to portfolio to remember balances
  browser.url(browser.launch_url + "#/portfolio")

  // check if balance header updates as expected
  // TODO find a way to know the rewards on an undelegation to know the final balance 100%
  console.log("Wait for total balance to update")
  await waitFor(async () => {
    const approximatedBalanceAfter = balanceBefore - expectedTotalChange - fees
    expect(
      Math.abs(approximatedBalanceAfter - (await getBalance(browser)))
    ).to.be.lessThan(2) // acounting for rewards being withdrawn on an undelegation
  })
  console.log("Wait for liquid balance to update")
  await waitFor(
    async () => {
      const approximatedAvailableBalanceAfter =
        availableTokensBefore - expectedAvailableTokensChange - fees
      expect(
        Math.abs(
          approximatedAvailableBalanceAfter -
            (await getAvailableTokens(browser))
        )
      ).to.be.lessThan(2) // acounting for rewards being withdrawn on an undelegation
    },
    10,
    2000
  )
}
async function nextBlock(browser) {
  browser.expect
    .element(`#tm-connected-network__block`)
    .to.be.visible.before(10000)
  const lastHeight = await new Promise(resolve =>
    browser.getText("#tm-connected-network__block", ({ value }) =>
      resolve(value)
    )
  )
  browser.expect
    .element("#tm-connected-network__block")
    .text.not.to.equal(lastHeight)
    .before(10 * 1000)
}

module.exports = {
  getBalance,
  getAvailableTokens,
  awaitBalance,
  waitFor,
  waitForText,
  actionModalCheckout,
  nextBlock
}
