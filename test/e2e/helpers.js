const numeral = require("numeral")
const { expect } = require("chai")

async function getBalance(browser) {
  return new Promise(resolve => {
    browser
      .waitForElementVisible(`.total-atoms__value`)
      .getText(".total-atoms__value", ({ value }) => {
        resolve(numeral(value).value())
      })
  })
}
async function getAvailableTokens(browser) {
  return new Promise(resolve => {
    browser
      .waitForElementVisible(`.unbonded-atoms h2`)
      .getText(".unbonded-atoms h2", ({ value }) => {
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

  throw new Error("Condition was not meet in time")
}
// performs some details actions and handles checking of the invoice step + signing
async function actionModalCheckout(
  browser,
  detailsActionFn,
  expectedSubtotal
  // expectedLiquidityChange = 0,
  // expectedAvailabilityChange = 0
) {
  // remember balance to compare later if send got through
  browser
    .waitForElementVisible(`.total-atoms__value`)
    .expect.element(".total-atoms__value")
    .text.not.to.contain("--")
    .before(10 * 1000)
  // const balanceBefore = await getBalance(browser)
  // const availableTokensBefore = await getAvailableTokens(browser)

  browser.waitForElementVisible(".action-modal")

  detailsActionFn()

  // proceed to invoice step
  browser
    .click(".action-modal-footer .tm-btn")
    .waitForElementVisible(`.table-invoice`)

  // check invoice
  browser.expect
    .element(".table-invoice li:first-child span:last-child")
    .text.to.contain(expectedSubtotal)

  // remember fees
  // const fees = await new Promise(resolve =>
  //   browser.getText(
  //     ".table-invoice li:nth-child(2) span:last-child",
  //     ({ value }) => resolve(numeral(value).value())
  //   )
  // )

  // await next block to be sure about the sequence number
  // TODO needs to be fixed and put into cosmos-js
  await nextBlock(browser)

  // submit
  browser
    .click(".action-modal-footer .tm-btn")
    .setValue("#password", "1234567890")
    .click(".action-modal-footer .tm-btn")

  browser.expect.element(".action-modal").not.to.be.present.before(10 * 1000)

  // Wait for UI to be updated according to new state
  await nextBlock(browser)

  // check if balance header updates as expected
  // TODO FIX
  // await waitFor(async () => {
  //   expect(
  //     String(balanceBefore - expectedLiquidityChange - fees)
  //   ).to.startsWith(String(await getBalance(browser)))
  // })
  // await waitFor(async () => {
  //   expect(
  //     String(availableTokensBefore - expectedAvailabilityChange - fees)
  //   ).to.startsWith(String(await getAvailableTokens(browser)))
  // })
}
async function nextBlock(browser) {
  const lastHeigth = await new Promise(resolve =>
    browser.getText("#tm-connected-network__block", ({ value }) =>
      resolve(value)
    )
  )
  browser.expect
    .element("#tm-connected-network__block")
    .text.not.to.equal(lastHeigth)
    .before(10 * 1000)
}

module.exports = {
  getBalance,
  getAvailableTokens,
  awaitBalance,
  waitFor,
  actionModalCheckout,
  nextBlock
}
