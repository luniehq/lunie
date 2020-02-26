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
    console.log(iterations)
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
  iterations,
  timeout
) {
  await waitFor(
    async () => {
      await browser.waitForElementVisible(selector, 10000)
      const result = await browser.getText(selector)
      console.log(result) // let's check what the property for error is
      if (!result.errors) {
        expect(result.value).to.include(expectedCaption)
      }
    },
    iterations,
    timeout
  )
}

async function getLastActivityItemHash(browser) {
  return await browser.execute(function() {
    return new Promise(resolve => {
      let attempts = 5
      let step = 1
      const f = () => {
        if (step == 1) {
          const container = document.querySelector(".tx-container .tx")
          if (!container && attempts-- > 0) {
            setTimeout(f, 2000)
            return false
          }
          if (container) {
            container.click()
            step = 2
            attempts = 5
            f()
          } else {
            resolve()
          }
        } else if (step == 2) {
          const hash = document.querySelector(
            ".tx-container:nth-of-type(1) .hash"
          )
          if (!hash && attempts-- > 0) {
            setTimeout(f, 2000)
            return false
          }
          resolve(hash ? hash.textContent : false)
        }
      }
      f()
    })
  })
}

// fetching errors from console
async function checkBrowserLogs(browser) {
  browser.getLog("browser", function(logEntriesArray) {
    logEntriesArray.forEach(function(log) {
      if (log.level == "ERROR") {
        throw new Error(log.message)
      }
    })
  })
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
  // deacivate intercom
  // can't be inserted before each as it would be removed on a refresh
  await browser.execute(function() {
    var sheet = window.document.styleSheets[0]
    sheet.insertRule(
      "#intercom-container { display: none !important; }",
      sheet.cssRules.length
    )
  })
  await browser.expect.element(btnSelector).to.be.visible.before(10000)
  await browser.click(btnSelector)
  browser.expect.element(".action-modal").to.be.visible.before(10000)

  await browser.pause(500)

  await detailsActionFn()

  // proceed to invoice step
  browser.click(".action-modal-footer .button:nth-of-type(2)")
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
  browser.click(".action-modal-footer .button:nth-of-type(2)")
  browser.setValue("#password", browser.globals.password)
  browser.click(".action-modal-footer .button:nth-of-type(2)")
  browser.pause(5000)

  await browser.expect.element(".success-step").to.be.present.before(30 * 1000)
  // wait for success-step modal
  await browser.expect
    .element("#closeBtn")
    .to.be.present.before(30 * 1000, () => {
      browser.click("#closeBtn")
    })
  // go to portfolio to remember balances
  browser.url(browser.launch_url + browser.globals.slug + "/portfolio")

  // check if balance header updates as expected
  // TODO find a way to know the rewards on an undelegation to know the final balance 100%
  console.log("Wait for total balance to update")
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
  //})
  //browser.expect.element(".success-step").to.be.present.before(20 * 1000)
}

async function getAccountBallance(browser) {
  // save denom
  return await browser.url(
    browser.launch_url + browser.globals.slug + "/portfolio",
    async () => {
      // waiting till balance loaded
      await browser.waitForElementVisible(".total-atoms h2", 5000, false)
      await browser.getText(".total-atoms h3", result => {
        browser.globals.denom = result.value.replace("Total ", "")
      })
      await browser.getText(".available-atoms h2", result => {
        browser.globals.availableAtoms = result.value.replace(",", "")
      })
      await browser.getText(".total-atoms__value", result => {
        browser.globals.totalAtoms = result.value.replace(",", "")
      })
    }
  )
}

async function nextBlock(browser) {
  // should be fixed
  browser
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
  getLastActivityItemHash,
  nextBlock,
  getAccountBallance,
  checkBrowserLogs,
  fundMasterAccount
}
