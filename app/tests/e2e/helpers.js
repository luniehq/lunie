const numeral = require("numeral")
const { expect } = require("chai")

async function getBalance(browser) {
  browser.expect.element(`.total`).to.be.visible.before(20000)
  const { value } = await browser.getText(".total")
  // the string is "123 ATOMs"
  return numeral(value.split(" ")[0]).value()
}
async function getDenom(browser) {
  browser.expect.element(`.total`).to.be.visible.before(20000)
  const { value } = await browser.getText(".total")
  // the string is "123 ATOMs"
  return value.split(" ")[1]
}
async function getAvailableTokens(browser) {
  browser.expect.element(`.available-amount`).to.be.visible.before(20000)
  const { value } = await browser.getText(".available-amount")
  // the string is "123"
  return numeral(value).value()
}
async function waitFor(check, iterations = 10, timeout = 1000) {
  while (--iterations) {
    try {
      await check()
      return
    } catch (err) {
      console.error(err.message)
      await new Promise((resolve) => setTimeout(resolve, timeout))
    }
  }

  console.error("Condition was not meet in time")
  process.exit(2) // exiting here so the e2e tests actually fail. if not they pass
}

async function fundMasterAccount(browser, network, address) {
  /*
   * there is a riot channel that funds the gaia testnet
   * we will sign in to riot and request the new account to be funded
   */
  if (network == "cosmos-hub-testnet") {
    await browser.url("https://riot.im/app/#/login")
    await browser.waitForElementVisible("#mx_PasswordLogin_username", 60000)
    await browser.setValue("#mx_PasswordLogin_username", "luniestaking")
    await browser.setValue("#mx_PasswordLogin_password", process.env.CHT_PWD)
    await browser.click(".mx_Login_submit")
    await browser.waitForElementVisible(".mx_RoomHeader_settingsButton", 60000)
    await browser.url("https://riot.im/app/#/room/#cosmos-faucet:matrix.org")
    await browser.setValue(
      ".mx_BasicMessageComposer_input",
      `show me the money! ${address}` // required message to get the account funded
    )
    await browser.keys(browser.Keys.ENTER)
  }
  return true
}

async function waitForText(
  browser,
  selector,
  expectedCaption,
  iterations = 20,
  timeout = 300
) {
  await browser.waitForElementVisible(selector, 50000)
  while (iterations--) {
    try {
      const { value: text } = await browser.getText(selector)
      console.log(
        `${selector} has text "${text}" expecting "${expectedCaption}"`
      )
      if (text && text.trim() === expectedCaption) return
    } catch (error) {
      console.error(error)
    }
    await browser.pause(timeout)
  }
  throw new Error("Timed out waiting for element and caption")
}

async function getLastActivityItemHash(browser) {
  await browser.waitForElementVisible(".tx-container .tx", 50000)
  await browser.click(".tx-container .tx")
  const { value: hash } = await browser.getText(
    ".tx-container:nth-of-type(1) .hash"
  )
  return hash
}

async function waitForHashUpdate(browser, lastHash) {
  let iterations = 20
  while (iterations--) {
    let hash = await getLastActivityItemHash(browser)
    if (hash !== lastHash) {
      return
    }
    await browser.pause(300)
  }
  throw new Error(`Hash didn't changed!`)
}

// performs some details actions and handles checking of the invoice step + signing
async function actionModalCheckout(
  browser,
  btnSelector,
  detailsActionFn,
  expectedSubtotal,
  expectedTotalChange = 0,
  expectedAvailableTokensChange = 0,
  checkUIUpdates = true
) {
  // deacivate intercom
  // can't be inserted before each as it would be removed on a refresh
  await browser.execute(function () {
    var sheet = window.document.styleSheets[0]
    sheet.insertRule(
      "#intercom-container { display: none !important; }",
      sheet.cssRules.length
    )
  })
  await browser.expect.element(btnSelector).to.be.visible.before(20000)
  await browser.click(btnSelector)
  browser.expect.element(".action-modal").to.be.visible.before(20000)

  await browser.pause(500)

  await detailsActionFn()

  // proceed to invoice step
  await browser.waitForElementVisible(
    ".action-modal-footer .button:nth-of-type(2):enabled",
    30000
  )
  await browser.click(".action-modal-footer .button:nth-of-type(2)")
  browser.expect.element(`.table-invoice`).to.be.visible.before(20000)

  if (checkUIUpdates) {
    // check invoice
    if (expectedSubtotal === "0") {
      // doesn't show sub total
      browser.expect.elements(".table-invoice li").count.to.equal(2)
    } else {
      browser.assert.containsText(
        ".table-invoice .sub-total span:last-child",
        expectedSubtotal
      )
    }
  }

  // wait until fees have been loaded
  browser.waitForElementVisible(
    ".action-modal-footer .button:nth-of-type(2):enabled",
    20000
  )

  let fees
  if (checkUIUpdates) {
    // remember fees
    const { value } = await browser.getText(
      ".table-invoice .fees span:last-child"
    )
    fees = numeral(value).value()
  }

  // await next block to be sure about the sequence number
  // TODO needs to be fixed and put into cosmos-api
  // await nextBlock(browser)

  // submit
  await browser.click(".action-modal-footer .button:nth-of-type(2)")
  await browser.setValue("#password", browser.globals.password)
  await browser.click(".action-modal-footer .button:nth-of-type(2)")

  await browser.expect.element(".success-step").to.be.present.before(60 * 1000)
  // wait for success-step modal
  await browser.expect.element("#closeBtn").to.be.present.before(30 * 1000)
  await browser.click("#closeBtn")

  if (checkUIUpdates) {
    // go to portfolio to remember balances
    await browser.url(browser.launch_url + browser.globals.slug + "/portfolio")

    // check if balance header updates as expected
    // TODO find a way to know the rewards on an undelegation to know the final balance 100%
    console.log(
      "Wait for total balance to update",
      browser.globals.totalAtoms,
      expectedTotalChange,
      fees
    )
    await waitFor(
      async () => {
        const approximatedBalanceAfter =
          browser.globals.totalAtoms - expectedTotalChange - fees
        expect(
          Math.abs(approximatedBalanceAfter - (await getBalance(browser)))
        ).to.be.lessThan(browser.globals.expectedDiff) // acounting for rewards being withdrawn on an undelegation
      },
      10,
      2000
    )
    console.log("Wait for liquid balance to update")
    await waitFor(
      async () => {
        const approximatedAvailableBalanceAfter =
          browser.globals.availableAtoms - expectedAvailableTokensChange - fees
        expect(
          Math.abs(
            approximatedAvailableBalanceAfter -
              (await getAvailableTokens(browser))
          )
        ).to.be.lessThan(browser.globals.expectedDiff) // acounting for rewards being withdrawn on an undelegation
      },
      10,
      2000
    )
  }
}

async function getAccountBalance(browser) {
  // save denom
  await browser.url(browser.launch_url + browser.globals.slug + "/portfolio")
  const denom = await getDenom(browser)
  browser.globals.denom = denom

  const total = await getBalance(browser)
  browser.globals.totalAtoms = total

  const availableAtoms = await getAvailableTokens(browser)
  browser.globals.availableAtoms = availableAtoms
}

async function nextBlock(browser) {
  // should be fixed
  browser
  browser.expect
    .element(`#tm-connected-network__block`)
    .to.be.visible.before(20000)
  const { value: lastHeight } = await browser.getText(
    "#tm-connected-network__block"
  )
  browser.expect
    .element("#tm-connected-network__block")
    .text.not.to.equal(lastHeight)
    .before(10 * 1000)
}

module.exports = {
  getBalance,
  getAvailableTokens,
  getDenom,
  waitFor,
  waitForText,
  actionModalCheckout,
  getLastActivityItemHash,
  waitForHashUpdate,
  nextBlock,
  getAccountBalance,
  fundMasterAccount,
}
