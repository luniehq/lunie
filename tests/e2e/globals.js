const axios = require("axios")
const chai = require("chai")
chai.use(require("chai-string"))

const HOST = "localhost"

module.exports = {
  // controls the timeout time for async hooks. Expects the done() callback to be invoked within this time
  // or an error is thrown
  asyncHookTimeout: 30000,

  async before() {
    // we need to wait until the testnet is up
    let apiUp = false
    while (!apiUp) {
      try {
        await axios(`http://${HOST}:9070/node_info`)
        apiUp = true
      } catch (err) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        console.log("Waiting for node to be up")
      }
    }

    // we need to wait until the backend is fully up
    let schmemaUp = false
    while (!schmemaUp) {
      try {
        await axios({
          url: `http://localhost:8080/v1/graphql`,
          method: "post",
          headers: {
            "Content-Type": "application/json"
          },
          data: {
            query: `
                query {
                  networks {
                    id
                  }
                }
                `
          }
        })
        schmemaUp = true
      } catch (err) {
        console.log(err)
        await new Promise(resolve => setTimeout(resolve, 1000))
        console.log("Waiting for schema to be available")
      }
    }
  },

  beforeEach(browser, done) {
    browser.url(browser.launch_url).execute(function() {
      window.localStorage.setItem(
        `cosmos-wallets-cosmos1ek9cd8ewgxg9w5xllq9um0uf4aaxaruvcw4v9e`,
        JSON.stringify({
          name: `rich_account`,
          address: `cosmos1ek9cd8ewgxg9w5xllq9um0uf4aaxaruvcw4v9e`,
          wallet: `ae1d20a49e1085cca29a71e270c6f64f8f86794cb67c6922caea6bcba0ed9e60g+nSTgP8/wHpWaomDkhW/7g2Xldvno3VRFggvdpWIDrRV+n4BJtpk3UpLKo0K3SDL5dRzxz3NmGFnSA8znggFmtesdqu6jWJYzSNqaQhM/gCPTVabF7t1UHaybze1NRlYcm/wl5oOyXRpki6ugOHxNhF7+4wlzhYxMilAB7ekDB4+VVHoPMUinU4dsUdtC4XwDUA0rbX1TTmrh+i1eBp6UTQ+nHGiZXL1TkhhR1mE0fR3bLRunz5XagYtjoST33pecQWzqeaZZQ/mgm9QXu/i+ymfbnPQkh8ivx+J6/d2RfZuAV4NnwFZDUr7CzPX4TU`
        })
      )
      window.localStorage.setItem(
        `cosmos-wallets-index`,
        JSON.stringify([
          {
            name: `rich_account`,
            address: `cosmos1ek9cd8ewgxg9w5xllq9um0uf4aaxaruvcw4v9e`
          }
        ])
      )

      // skip sign in
      window.localStorage.setItem(
        `session`,
        JSON.stringify({
          localKeyPairName: `rich_account`,
          address: "cosmos1ek9cd8ewgxg9w5xllq9um0uf4aaxaruvcw4v9e",
          sessionType: "local"
        })
      )

      return true
    }, [])

    browser.resizeWindow(1350, 1080)
    browser.refresh()
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
