const axios = require("axios")
const chai = require("chai")
chai.use(require("chai-string"))
const networks = require("./networks.json")
const { actionModalCheckout, nextBlock, waitForText } = require("./helpers.js")

module.exports = {
  // controls the timeout time for async hooks. Expects the done() callback to be invoked within this time
  // or an error is thrown
  asyncHookTimeout: 60000,

  async beforeEach(browser, done) {
    // default settings
    let network = "cosmos-hub-testnet"
    let feURI = "http://localhost:9080"
    let apiURI = "http://localhost:4000"
    let networkData = {}
    // parsing parameters
    // network
    process.argv.map(arg => {
      // selected network
      if (arg.indexOf("--network=") !== -1)
        network = arg.slice(arg.indexOf("=") + 1)
      // frontend uri
      if (arg.indexOf("--fe=") !== -1) feURI = arg.slice(arg.indexOf("=") + 1)
      // api uri
      if (arg.indexOf("--api=") !== -1) apiURI = arg.slice(arg.indexOf("=") + 1)
    })
    networkData = networks.find(net => net.network == network)
    if (!networkData) {
      throw new Error(`Initial data for "${network}" is not set`)
    }
    if (!feURI) {
      throw new Error(`Frontend uri for "${network}" is not set`)
    }
    if (!apiURI) {
      throw new Error(`API uri for "${network}" is not set`)
    }
    browser.launch_url = feURI
    browser.globals.apiURI = apiURI
    // checking the API for a localhost API
    if (apiURI.indexOf("//localhost:") !== -1) {
      apiUp(browser)
    }
    // checking if network is local, the API should be local too
    if (network.indexOf("local-") === 0) {
      if (apiURI.indexOf("//localhost:") === -1){
        throw new Error(
          `Can't test local network "${network}" against nonlocal API`
        )
      }
    }
    // setting the api
    await browser.url(browser.launch_url)
    browser.execute(
      function(apiURI) {
        window.localStorage.setItem("persistentapi", apiURI)
      },
      [apiURI]
    )
    // creating testing account and funding it with the master account
    await createAccountAndFundIt(browser, done, networkData)
    done()
  },

  /**
   * After all the tests are run, evaluate if there were errors and exit appropriately.
   *
   * If there were failures or errors, exit 1, else exit 0.
   *
   * @param results
   */
  reporter: function(results) {
    if (
      (typeof results.failed === `undefined` || results.failed === 0) &&
      (typeof results.error === `undefined` || results.error === 0)
    ) {
      process.exit(0)
    } else {
      process.exit(1)
    }
  }
}

async function next(browser) {
  browser.execute(
    function(selector, scrollX, scrollY) {
      var elem = document.querySelector(selector)
      elem.scrollLeft = scrollX
      elem.scrollTop = scrollY
    },
    [".session", 0, 500]
  )
  browser.pause(200)
  return browser.click(".session-footer .button")
}

async function createAccountAndFundIt(browser, done, networkData) {  
  // changing network
  await browser.url(browser.launch_url)
  await browser.execute(
    function(networkData) {
      window.localStorage.setItem(`network`, `"${networkData.network}"`)
      return true
    },
    [networkData]
  )
  await browser.refresh()
  // creating account
  await browser.url(browser.launch_url + "/welcome?insecure=true", async () => {
    browser.waitForElementVisible(`body`, 10000, true)
    browser.click("#create-new-address")
    browser.waitForElementVisible("#sign-up-name", 10000, true)
    browser.setValue("#sign-up-name", "demo-account")
    await next(browser)
    browser.waitForElementVisible("#sign-up-password", 10000, true)
    await next(browser)
    browser.setValue("#sign-up-password", "1234567890")
    browser.setValue("#sign-up-password-confirm", "1234567890")
    await next(browser)
    browser.waitForElementVisible(".seed-table", 10000, true)
    browser.expect
      .element(".seed-table")
      .text.to.match(/(\d+\s+\w+\s+){23}\d+\s+\w+/)
      .before(10000)
    await next(browser)
    browser.expect.elements(".tm-form-msg--error").count.to.equal(1)
    browser.click("#sign-up-warning")
    await next(browser)
  })
  // refreshing and saving all needed info of a newly created account
  await browser.url(browser.launch_url)
  const tempAcc = await browser.execute(
    function(networkData) {
      // saving account info from localStorage
      let session = window.localStorage.getItem(
        `session_${networkData.network}`
      )
      let wallet
      if (session) {
        session = JSON.parse(session)
        wallet = window.localStorage.getItem(
          `cosmos-wallets-${session.address}`
        )
        if (wallet) {
          wallet = JSON.parse(wallet)
        } else {
          throw new Error(
            `No wallet info for newly created account in ${networkData.network}`
          )
        }
      } else {
        throw new Error(
          `No session info for newly created account in ${networkData.network}`
        )
      }
      return {
        address: session.address,
        wallet: wallet.wallet
      }
    },
    [networkData]
  )
  // wallet info
  browser.globals.wallet = tempAcc.value.wallet
  // address
  browser.globals.address = tempAcc.value.address
  // switching to master account
  await switchToAccount(browser, networkData)

  // funding temp account
  await browser.url(browser.launch_url + "/portfolio", async () => {
    //browser.click(".modal-tutorial .close")
    await actionModalCheckout(
      browser,
      ".send-button",
      // actions to do on details page
      () => {
        browser.setValue("#send-address", browser.globals.address)
        browser.clearValue("#amount")
        browser.setValue("#amount", networkData.fundingAmount)
      },
      // expected subtotal
      networkData.fundingAmount
    )
    await nextBlock(browser)
    // check if tx shows
    browser.url(browser.launch_url + "/transactions")
    browser.pause(1000)
    await waitForText(
      browser,
      ".tx:nth-of-type(1) .tx__content .tx__content__left",
      "Sent"
    )
    await waitForText(
      browser,
      ".tx:nth-of-type(1) .tx__content .tx__content__right",
      `${networkData.fundingAmount} ${browser.globals.denom}`
    )
  })
  // switching to temp account
  networkData.address = browser.globals.address
  networkData.wallet = browser.globals.wallet
  networkData.password = "1234567890"
  await switchToAccount(browser, networkData)
  done()
}

async function switchToAccount(
  browser,
  { address, network, wallet, password, name, stakeAmount, restakeAmount }
) {
  // clear parameters
  browser.globals.availableAtoms = 0
  browser.globals.denom = ""
  browser.globals.password = password
  browser.globals.stakeAmount = stakeAmount
  browser.globals.restakeAmount = restakeAmount
  // test if the test account was funded as we need the account to have funds in the tests
  return axios
    .post(browser.globals.apiURI, {
      query: `{overview(networkId: "${network}", address: "${address}") {totalStake}}`
    })
    .then(async response => {
      if (response.data.errors) {
        throw new Error(JSON.stringify(response.data.errors))
      }
      if (Number(response.data.data.overview.totalStake) === 0) {
        throw new Error(`Account ${address} in ${network} has no funds`)
      }
      await browser.url(browser.launch_url)
      await browser.execute(
        function({ address, network, wallet, name }) {
          // setting network
          window.localStorage.setItem(`network`, `"${network}"`)
          // skip sign in
          window.localStorage.setItem(
            `session_${network}`,
            JSON.stringify({
              address: address,
              sessionType: "local"
            })
          )
          // setting wallet
          window.localStorage.setItem(
            `cosmos-wallets-${address}`,
            JSON.stringify({
              name: name,
              wallet: wallet,
              address: address
            })
          )
          return true
        },
        [{ address, network, wallet, name }]
      )
      browser.resizeWindow(1350, 1080)
      browser.refresh()
      // wait until on portfolio page to make sure future tests have the same state
      browser.expect.element(".balance-header").to.be.visible.before(10000)
      // save denom
      await browser.url(browser.launch_url + "/portfolio", async () => {
        // waiting till balance loaded
        await browser.waitForElementVisible(".total-atoms h3", 5000, false)
        await browser.getText(".total-atoms h3", result => {
          browser.globals.denom = result.value.replace("Total ", "")
        })
        await browser.getText(".available-atoms h2", result => {
          browser.globals.availableAtoms = result.value
        })
        await browser.getText(".total-atoms__value", result => {
          browser.globals.totalAtoms = result.value
        })
      })
      // switching to homepage
      await browser.url(browser.launch_url)
      return true
    })
}

async function apiUp(browser) {
  console.log("Testing if API is up")
  const start = new Date().getTime()
  // we need to wait until the testnet is up and the account has money
  let apiUp = false
  while (!apiUp) {
    if (new Date().getTime() - start > 90000) {
      throw new Error("Timed out waiting for API to be up.")
    }
    try {
      // test if the api can return networks list
      const response = await axios.post(browser.globals.apiURI, {
        query: `{networks {id}}`
      })
      if (response.data.errors) {
        throw new Error(JSON.stringify(response.data.errors))
      }
      if (Number(response.data.data.networks.length) === 0) {
        continue
      }
      apiUp = true
    } catch (err) {
      console.log("Failed to check API", err)
      console.log("Waiting 1s for API to be up")
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
}
