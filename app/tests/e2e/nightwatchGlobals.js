const axios = require("axios")
const chai = require("chai")
chai.use(require("chai-string"))
const networks = require("./networks.json")
const { actionModalCheckout, getAccountBalance } = require("./helpers.js")

let initializedAccount = false

module.exports = {
  // controls the timeout time for async hooks. Expects the done() callback to be invoked within this time
  // or an error is thrown
  asyncHookTimeout: 200000,

  async beforeEach(browser, done) {
    // standardize window format
    browser.resizeWindow(1350, 1080)

    // browser.launch_url = browser.globals.feURI
    // default settings
    let networkData = await initialiseDefaults(browser)
    networkData.password = process.env.PASSWORD
    browser.globals.password = networkData.password

    if (!initializedAccount) {
      // creating testing account and funding it with the master account
      await createAccountAndFundIt(browser, done, networkData)
      initializedAccount = true
    } else {
      await switchToAccount(browser, networkData)
    }

    done()
  },

  /**
   * After all the tests are run, evaluate if there were errors and exit appropriately.
   *
   * If there were failures or errors, exit 1, else exit 0.
   *
   * @param results
   */
  reporter: function (results) {
    if (
      (typeof results.failed === `undefined` || results.failed === 0) &&
      (typeof results.errors === `undefined` || results.errors === 0)
    ) {
      process.exit(0)
    } else {
      process.exit(1)
    }
  },
}

async function next(browser) {
  return await browser.click(".session-footer .button")
}

async function createNewAccount(browser, networkData) {
  await browser.url(browser.launch_url + "/create")
  await browser.waitForElementVisible("#sign-up-name", 20000, true)
  browser.setValue("#sign-up-name", "demo-account")
  await next(browser)
  browser.waitForElementVisible("#sign-up-password", 20000, true)
  browser.setValue("#sign-up-password", networkData.password)
  browser.setValue("#sign-up-password-confirm", networkData.password)
  await next(browser)
  browser.click("#sign-up-warning")
  await next(browser)
  browser.waitForElementVisible(".balance-header", 20000, true) // wait until signup is completed
}

async function initialiseDefaults(browser) {
  let network = "cosmos-hub-testnet"
  let feURI = "http://localhost:9080"
  let apiURI = "http://localhost:4000"
  let networkData = {}
  // parsing parameters
  // network
  process.argv.map((arg) => {
    // selected network
    if (arg.indexOf("--network=") !== -1)
      network = arg.slice(arg.indexOf("=") + 1)
    // frontend uri
    if (arg.indexOf("--fe=") !== -1)
      feURI = arg.slice(arg.indexOf("=") + 1).replace(/\/$/, "")
    // api uri
    if (arg.indexOf("--api=") !== -1) apiURI = arg.slice(arg.indexOf("=") + 1)
  })
  networkData = networks.find((net) => net.network == network)
  if (!networkData) {
    throw new Error(`Initial data for "${network}" is not set`)
  }
  if (!feURI) {
    throw new Error(`Frontend uri for "${network}" is not set`)
  }
  if (!apiURI) {
    throw new Error(`API uri for "${network}" is not set`)
  }
  browser.globals.feURI = browser.launch_url = feURI
  browser.globals.apiURI = apiURI
  browser.globals.slug = "/" + networkData.slug
  browser.globals.expectedDiff = networkData.expectedDiff
  browser.globals.network = networkData.network
  browser.globals.type = networkData.type
  browser.globals.address = networkData.address
  browser.globals.wallet = networkData.wallet
  browser.globals.seed = networkData.seed
  // checking if network is local, the API should be local too
  if (network.indexOf("local-") === 0) {
    if (apiURI.indexOf("//localhost:") === -1) {
      throw new Error(
        `Can't test local network "${network}" against nonlocal API`
      )
    }
  }
  // open default page
  await browser.url(browser.launch_url + browser.globals.slug + "/portfolio")
  await browser.execute(
    function (apiURI) {
      // setting the api to localStorage
      window.localStorage.setItem("persistentapi", apiURI)
      // clear data from older tests
      window.localStorage.removeItem(`cosmos-wallets-index`)
      window.localStorage.setItem(`isE2eTest`, `"true"`)
    },
    [apiURI]
  )
  await browser.refresh()
  return networkData
}

async function defineNeededValidators(browser) {
  // need to store validators, cause they can shuffle during the test
  await browser.url(browser.launch_url + browser.globals.slug + "/validators")
  await browser.waitForElementVisible(".li-validator", 30000)
  const validators = await browser.execute(function () {
    const validatorLIs = document.getElementsByClassName("li-validator")
    if (validatorLIs.length < 2) {
      throw new Error(`No enough validators to check`)
    }
    return {
      first: validatorLIs[0].getAttribute("data-name"),
      second: validatorLIs[1].getAttribute("data-name"),
    }
  })
  browser.globals.validatorOneName = validators.value.first
  browser.globals.validatorTwoName = validators.value.second
}

async function storeAccountData(browser, networkData) {
  // refreshing and saving all needed info of a newly created account
  await browser.pause(500) // needed for localStorage variable setting
  await browser.url(browser.launch_url)
  const tempAcc = await browser.execute(
    function (networkData) {
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
        wallet: wallet.wallet,
      }
    },
    [networkData]
  )
  // wallet info
  browser.globals.wallet = tempAcc.value.wallet
  // address
  browser.globals.address = tempAcc.value.address
  return true
}

async function fundingTempAccount(browser, networkData) {
  await browser.url(browser.launch_url + browser.globals.slug + "/portfolio")
  await actionModalCheckout(
    browser,
    ".table-cell.actions button",
    // actions to do on details page
    async () => {
      await browser.setValue("#send-address", browser.globals.address)
      await browser.clearValue("#amount")
      await browser.setValue("#amount", networkData.fundingAmount)
    },
    // expected subtotal
    networkData.fundingAmount,
    networkData.fundingAmount,
    networkData.fundingAmount,
    false // ignore checks to speed up and to prevent issues with race conditions
  )
}

async function createAccountAndFundIt(browser, done, networkData) {
  // changing network
  await browser.url(browser.launch_url + browser.globals.slug)

  // define two first validators
  await defineNeededValidators(browser, networkData)
  // creating account
  await createNewAccount(browser, networkData)
  await storeAccountData(browser, networkData)
  // switching to master account
  await switchToAccount(browser, networkData)
  // funding main account
  if (browser.globals.availableAtoms * 1 < 10) {
    throw new Error("Master Account is out of funds. Fund it!")
    // await fundMasterAccount(browser, networkData.network, networkData.address)
  }
  // funding temp account
  await fundingTempAccount(browser, networkData)
  networkData.address = browser.globals.address
  networkData.wallet = browser.globals.wallet
  networkData.password = "1234567890"
  // switching to temp account
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
  const response = await axios.post(browser.globals.apiURI, {
    query: `{balancesV2(networkId: "${network}", address: "${address}") {total}}`,
  })
  if (response.data.errors) {
    throw new Error(JSON.stringify(response.data.errors))
  }
  if (Number(response.data.data.balancesV2.total) === 0) {
    throw new Error(`Account ${address} in ${network} has no funds`)
  }
  await browser.url(browser.launch_url)
  await browser.execute(
    function ({ address, network, wallet, name }) {
      // skip sign in
      window.localStorage.setItem(
        `session_${network}`,
        JSON.stringify({
          address,
          sessionType: "local",
          HDPath: `m/44'/118'/0'/0/0`,
          curve: `ed25519`,
          networkId: network,
        })
      )
      // setting wallet
      window.localStorage.setItem(
        `cosmos-wallets-${address}`,
        JSON.stringify({
          name,
          wallet,
          address,
          HDPath: `m/44'/118'/0'/0/0`,
          curve: `ed25519`,
          network,
        })
      )
      return true
    },
    [{ address, network, wallet, name }]
  )
  // await browser.refresh() // not needed as getAccountBalance moves to portfolio
  await getAccountBalance(browser)
  return true
}
