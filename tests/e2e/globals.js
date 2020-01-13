const axios = require("axios")
const chai = require("chai")
chai.use(require("chai-string"))
const networks = require("./networks.json")

const HOST = "127.0.0.1"

module.exports = {
  // controls the timeout time for async hooks. Expects the done() callback to be invoked within this time
  // or an error is thrown
  asyncHookTimeout: 30000,

  async before() {
    await schemaAvailable()
    await apiUp()
  },

  beforeEach(browser, done) {
    let network = 1
    let networkData = {}
    process.argv.map(arg => {
      if (arg.indexOf("--network=") !== -1)
        network = arg.slice(arg.indexOf("=") + 1)
    })
    if (networks.length >= network) {
      networkData = networks[network - 1]
    }
    switchToAccount(browser, done, networkData)
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

function switchToAccount(
  browser,
  done,
  { address, network, wallet, password, name, stakeAmount, restakeAmount }
) {
  // clear parameters
  browser.globals.availableAtoms = 0
  browser.globals.denom = ""
  browser.globals.password = password
  browser.globals.stakeAmount = stakeAmount
  browser.globals.restakeAmount = restakeAmount
  // test if the test account was funded as we need the account to have funds in the tests
  axios
    .post(`http://${HOST}:4000`, {
      query: `{overview(networkId: "${network}", address: "${address}") {totalStake}}`
    })
    .then(async response => {
      if (response.data.errors) {
        throw new Error(JSON.stringify(response.data.errors))
      }
      if (Number(response.data.data.overview.totalStake) === 0) {
        throw new Error(`Account ${address} in ${network} has no funds`)
      }
      browser.url(browser.launch_url).execute(
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
      browser.url(browser.launch_url + "/portfolio", () => {
        // waiting till balance loaded
        browser.waitForElementVisible(".total-atoms h3", 5000, false)
        browser.getText(".total-atoms h3", result => {
          browser.globals.denom = result.value.replace("Total ", "")
        })
        browser.getText(".available-atoms h2", result => {
          browser.globals.availableAtoms = result.value
        })
        browser.getText(".total-atoms__value", result => {
          browser.globals.totalAtoms = result.value
        })
      })
      // switching to homepage
      browser.url(browser.launch_url, () => {
        // beforeEach done
        done()
      })
    })
}

async function apiUp() {
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
      const response = await axios.post(`http://${HOST}:4000`, {
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

async function schemaAvailable() {
  console.log("Testing if DB is up")
  const start = new Date().getTime()
  // we need to wait until the database is up and has the expected shema
  let databaseUp = false
  while (!databaseUp) {
    if (new Date().getTime() - start > 90000) {
      throw new Error("Timed out waiting for database to be up.")
    }
    try {
      // test if the database has the expected schema by probing one setup table
      await axios.post(`http://${HOST}:8080/v1/graphql`, {
        query: `{maintenance {    message  }}`
      })
      databaseUp = true
    } catch (err) {
      console.log("Failed to check database", err.message)
      console.log("Waiting 1s for database to be up")
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
}
