module.exports = {
  "Sign in with local account": async function (browser) {
    await prepare(browser)

    await browser.waitForElementVisible("#sign-in-with-account", 30000, true)
    await browser.click("#sign-in-with-account")
    await browser.waitForElementVisible("#sign-in-name", 30000, true)
    await browser.click(
      "#sign-in-name option[value=cosmos1ek9cd8ewgxg9w5xllq9um0uf4aaxaruvcw4v9e]"
    )
    browser.setValue("#sign-in-password", "1234567890")
    await next(browser)
    // check if signed in
    await browser.waitForElementNotPresent(".session", 30000, true)
    openMenu(browser)
    await browser.waitForElementVisible("#sign-out", 30000, true)
  },
  "Import local account": async function (browser) {
    await prepare(browser)

    browser.waitForElementVisible("#recover-with-backup", 30000, true)
    // scroll to bottom
    await browser.execute("window.scrollTo(0,document.body.scrollHeight);")
    browser.click("#recover-with-backup")

    await browser.waitForElementVisible(
      `.select-network-item[data-network=cosmos-hub-mainnet]`,
      30000,
      true
    )
    await browser.click(`.select-network-item[data-network=cosmos-hub-mainnet]`)

    browser.waitForElementVisible("#import-seed", 30000, true)
    await next(browser)
    browser.expect.elements(".tm-form-msg--error").count.to.equal(1)
    browser.setValue(
      "#import-seed",
      `lab stable vessel rose donkey panel slim assault cause tenant level yellow sport argue rural pizza supply idea detect brass shift aunt matrix simple`
    )
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
    await openMenu(browser)
    await browser.waitForElementVisible("#sign-out", 30000, true)
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

async function closeMenu(browser) {
  await browser.waitForElementVisible(".close-menu", 30000, true)
  await browser.click(".close-menu")
}

async function signOut(browser) {
  await openMenu(browser)
  await browser.waitForElementVisible("#sign-out", 30000, true)
  await browser.click("#sign-out")
}

async function signIn(browser) {
  await openMenu(browser)
  await browser.waitForElementVisible("#sign-in", 30000, true)
  await browser.click("#sign-in")
}

async function prepare(browser) {
  browser.resizeWindow(400, 1024) // force mobile screen to be able to click some out of screen buttons
  await browser.url(browser.launch_url + "?insecure=true")
  browser.waitForElementVisible(`body`, 30000, true)
  browser.waitForElementVisible(`#app-content`, 30000, true)

  // add a standard account to be used for signing in to an existing account
  await browser.execute(function () {
    window.localStorage.setItem(
      "cosmos-wallets-index",
      JSON.stringify([
        {
          name: "demo",
          address: "cosmos1ek9cd8ewgxg9w5xllq9um0uf4aaxaruvcw4v9e",
        },
      ])
    )
    window.localStorage.setItem(
      `cosmos-wallets-cosmos1ek9cd8ewgxg9w5xllq9um0uf4aaxaruvcw4v9e`,
      JSON.stringify({
        name: `rich_account`,
        address: `cosmos1ek9cd8ewgxg9w5xllq9um0uf4aaxaruvcw4v9e`,
        wallet: `ae1d20a49e1085cca29a71e270c6f64f8f86794cb67c6922caea6bcba0ed9e60g+nSTgP8/wHpWaomDkhW/7g2Xldvno3VRFggvdpWIDrRV+n4BJtpk3UpLKo0K3SDL5dRzxz3NmGFnSA8znggFmtesdqu6jWJYzSNqaQhM/gCPTVabF7t1UHaybze1NRlYcm/wl5oOyXRpki6ugOHxNhF7+4wlzhYxMilAB7ekDB4+VVHoPMUinU4dsUdtC4XwDUA0rbX1TTmrh+i1eBp6UTQ+nHGiZXL1TkhhR1mE0fR3bLRunz5XagYtjoST33pecQWzqeaZZQ/mgm9QXu/i+ymfbnPQkh8ivx+J6/d2RfZuAV4NnwFZDUr7CzPX4TU`,
      })
    )
    return true
  }, [])
  await browser.url(browser.launch_url + "?insecure=true")

  // check if we are already singed in
  await openMenu(browser)
  const signedIn = await isSignedIn(browser)
  await closeMenu(browser)

  if (signedIn) {
    await signOut(browser)
  }
  await signIn(browser)
}

async function isSignedIn(browser) {
  const { value } = await browser.execute(async function () {
    let signOutElement
    for (let attempts = 3; attempts > 0; attempts--) {
      signOutElement = document.querySelector(".user-box-address #sign-out")
      if (!signOutElement) {
        await new Promise((resolve) => setTimeout(resolve, 2000))
        continue
      }
    }
    if (!signOutElement) {
      return false // not signed in
    }
    return true // signed in as sign out element present
  })

  return value
}
