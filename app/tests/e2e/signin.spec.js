module.exports = {
  "Sign in with local account": async function (browser) {
    await prepare(browser)

    await browser.waitForElementVisible("#sign-in-with-account", 30000, true)
    await browser.click("#sign-in-with-account")
    await browser.waitForElementVisible("#sign-in-name", 30000, true)
    browser.setValue("#sign-in-password", "1234567890")
    await next(browser)
    // check if signed in
    await browser.waitForElementNotPresent(".session", 30000, true)
    await browser.waitForElementVisible(".user-menu .address", 30000, true)
  },
  "Import local account": async function (browser) {
    await prepare(browser)

    browser.waitForElementVisible("#recover-with-backup", 30000, true)
    // scroll to bottom
    await browser.execute("window.scrollTo(0,document.body.scrollHeight);")
    browser.click("#recover-with-backup")

    await browser.waitForElementVisible(
      `.select-network-item[data-network=${browser.globals.network}]`,
      30000,
      true
    )
    if (browser.globals.type === `polkadot`) {
      // scroll to bottom
      await browser.execute("window.scrollTo(0,document.body.scrollHeight);")
    }
    await browser.click(
      `.select-network-item[data-network=${browser.globals.network}]`
    )

    browser.waitForElementVisible("#import-seed", 30000, true)
    await next(browser)
    if (browser.globals.type === `polkadot`) {
      browser.expect.elements(".tm-form-msg--error").count.to.equal(2)
    } else {
      browser.expect.elements(".tm-form-msg--error").count.to.equal(1)
    }
    browser.setValue("#import-seed", browser.globals.seed)
    await next(browser)

    browser.waitForElementVisible("#import-name", 30000, true)
    await next(browser)
    browser.expect.elements(".tm-form-msg--error").count.to.equal(1)
    browser.setValue("#import-name", "demo-account-imported")
    await next(browser)

    browser.waitForElementVisible("#import-password", 30000, true)
    await next(browser)
    browser.expect.elements(".tm-form-msg--error").count.to.equal(1)
    browser.setValue("#import-password", "1234567890")
    await next(browser)
    browser.expect.elements(".tm-form-msg--error").count.to.equal(1)
    browser.setValue("#import-password-confirmation", "1234567890")
    await next(browser)

    // check if signed in
    await browser.waitForElementNotPresent(".session", 30000, true)
    await browser.waitForElementVisible(".user-menu .address", 30000, true)
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

async function openMenu(browser) {
  await browser.waitForElementVisible(".open-menu", 30000, true)
  await browser.click(".open-menu")
}

async function prepare(browser) {
  await browser.url(
    browser.launch_url +
      browser.globals.slug +
      "?insecure=true&experimental=true"
  )
  browser.waitForElementVisible(`body`, 30000, true)
  browser.waitForElementVisible(`#app-content`, 30000, true)

  // add a standard account to be used for signing in to an existing account
  await browser.execute(
    function (network, address, wallet) {
      window.localStorage.setItem(
        "cosmos-wallets-index",
        JSON.stringify([
          {
            name: "demo",
            address,
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

  // check if we are already signed in
  await browser.click(".session-close")
  await browser.waitForElementVisible("#open-user-menu", 30000, true)
  await browser.pause(1000)
  await browser.click("#open-user-menu")
  await browser.waitForElementVisible("#create-new-account", 30000, true)
  await browser.pause(1000)
  await browser.click("#create-new-account")
}
