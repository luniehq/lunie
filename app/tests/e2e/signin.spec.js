module.exports = {
  "Sign in with local account": async function (browser) {
    await prepare(browser)

    await browser.click(
      `.address-list-item[data-address-name="demo-account"] .address-item`
    )
    await browser.waitForElementVisible(".user-menu .address", 20000, true)
  },
  "Import local account": async function (browser) {
    await prepare(browser)

    await browser.click("#create-new-account")
    await browser.waitForElementVisible("#recover-with-backup", 20000, true)
    // scroll to bottom
    await browser.execute("window.scrollTo(0,document.body.scrollHeight);")
    browser.click("#recover-with-backup")

    await browser.waitForElementVisible(
      `.select-network-item[data-network=${browser.globals.network}]`,
      20000,
      true
    )
    await browser.click(
      `.select-network-item[data-network=${browser.globals.network}]`
    )

    browser.waitForElementVisible("#import-seed", 20000, true)
    await next(browser)
    browser.expect.elements(".tm-form-msg--error").count.to.equal(1)
    browser.setValue("#import-seed", browser.globals.seed)
    await next(browser)

    browser.waitForElementVisible("#import-name", 20000, true)
    await next(browser)
    browser.expect.elements(".tm-form-msg--error").count.to.equal(1)
    browser.setValue("#import-name", "demo-account-imported")
    await next(browser)

    browser.waitForElementVisible("#import-password", 20000, true)
    await next(browser)
    browser.expect.elements(".tm-form-msg--error").count.to.equal(1)
    browser.setValue("#import-password", "1234567890")
    await next(browser)
    browser.expect.elements(".tm-form-msg--error").count.to.equal(1)
    browser.setValue("#import-password-confirmation", "1234567890")
    await next(browser)

    // check if signed in
    await browser.waitForElementNotPresent(".session", 20000, true)
    await browser.waitForElementVisible(".user-menu .address", 20000, true)
  },
}

async function next(browser) {
  await browser.execute(
    function (selector, scrollX, scrollY) {
      var elem = document.querySelector(selector)
      elem.scrollLeft = scrollX
      elem.scrollTop = scrollY
    },
    [".session", 0, 500]
  )
  await browser.pause(200)
  return browser.click(".session-footer .button")
}

async function prepare(browser) {
  await browser.url(
    browser.launch_url +
      browser.globals.slug +
      "?insecure=true&experimental=true"
  )
  browser.waitForElementVisible(`body`, 20000, true)
  browser.waitForElementVisible(`#app-content`, 20000, true)

  // add a standard account to be used for signing in to an existing account
  await browser.execute(
    function (network, address, wallet) {
      window.localStorage.setItem(
        "cosmos-wallets-index",
        JSON.stringify([
          {
            name: "demo-account",
            address,
            network,
            HDPath: `m/44'/118'/0'/0/0`,
            curve: `ed25519`,
          },
        ])
      )
      window.localStorage.setItem(
        `cosmos-wallets-${address}`,
        JSON.stringify({
          name: `rich_account`,
          address,
          wallet,
        })
      )
      window.localStorage.removeItem(`session_${network}`)
      return true
    },
    [browser.globals.network, browser.globals.address, browser.globals.wallet]
  )

  await browser.url(
    browser.launch_url +
      browser.globals.slug +
      "?insecure=true&experimental=true"
  )

  // open user menu
  await browser.click(".session-close")
  await browser.waitForElementVisible("#open-user-menu", 20000, true)
  await browser.click("#open-user-menu")
}
