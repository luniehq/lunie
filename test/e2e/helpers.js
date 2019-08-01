const numeral = require("numeral")
const { expect } = require("chai")

async function getBalance(browser) {
  return new Promise(resolve => {
    browser.expect.element(`.total-atoms`).to.be.visible.before(10000)
    browser.getText(".total-atoms", ({ value }) => {
      resolve(numeral(value).value())
    })
  })
}
async function getAvailableTokens(browser) {
  return new Promise(resolve => {
    browser.expect.element(`.liquid-atoms`).to.be.visible.before(10000)
    browser.getText(".liquid-atoms", ({ value }) => {
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
  expectedSubtotal,
  expectedTotalChange = 0,
  expectedAvailableTokensChange = 0
) {
  openMenu(browser)

  // remember balance to compare later if send got through
  browser.expect.element(`.total-atoms`).to.be.visible.before(10000)
  browser.expect
    .element(".total-atoms")
    .text.not.to.contain("--")
    .before(10 * 1000)
  const balanceBefore = await getBalance(browser)
  const availableTokensBefore = await getAvailableTokens(browser)

  browser.expect.element(".action-modal").to.be.visible.before(10000)

  browser.pause(500)

  browser.waitForElementNotPresent(".tm-form-msg--error")

  await detailsActionFn()

  // proceed to invoice step
  browser.click(".action-modal-footer .tm-btn")
  browser.expect.element(`.table-invoice`).to.be.visible.before(10000)

  // check invoice
  browser.expect
    .element(".table-invoice li:first-child span:last-child")
    .text.to.contain(expectedSubtotal)

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
  browser.click(".action-modal-footer .tm-btn")
  browser.setValue("#password", "1234567890")
  browser.click(".action-modal-footer .tm-btn")

  browser.expect.element(".success-step").to.be.present.before(20 * 1000)
  browser.click("#closeBtn")

  // Wait for UI to be updated according to new state
  await nextBlock(browser)
  openMenu(browser)

  // check if balance header updates as expected
  // TODO find a way to know the rewards on an undelegation to know the final balance 100%
  await waitFor(async () => {
    const approximatedBalanceAfter = balanceBefore - expectedTotalChange - fees
    expect(
      Math.abs(approximatedBalanceAfter - (await getBalance(browser)))
    ).to.be.lessThan(2) // acounting for rewards being withdrawn on an undelegation
  })
  await waitFor(async () => {
    const approximatedAvailableBalanceAfter =
      availableTokensBefore - expectedAvailableTokensChange - fees
    expect(
      Math.abs(
        approximatedAvailableBalanceAfter - (await getAvailableTokens(browser))
      )
    ).to.be.lessThan(2) // acounting for rewards being withdrawn on an undelegation
  })

  closeMenu(browser)
}
async function nextBlock(browser) {
  openMenu(browser)
  const lastHeigth = await new Promise(resolve =>
    browser.getText("#tm-connected-network__block", ({ value }) =>
      resolve(value)
    )
  )
  browser.expect
    .element("#tm-connected-network__block")
    .text.not.to.equal(lastHeigth)
    .before(10 * 1000)

  closeMenu(browser)
}

function openMenu(browser) {
  browser.moveToElement(".v-navigation-drawer", 10, 10)
}

function closeMenu(browser) {
  browser.moveToElement(".v-navigation-drawer", 900, 10)
}

module.exports = {
  getBalance,
  getAvailableTokens,
  awaitBalance,
  waitFor,
  actionModalCheckout,
  nextBlock,
  openMenu,
  closeMenu
}
