module.exports = {
  /*"Sign in with local account": async function(browser) {
    prepare(browser)

    await browser.click("#use-an-existing-address")
    await browser.waitForElementVisible("#sign-in-with-account", 10000, true)
    await browser.pause(500)
    await browser.click("#sign-in-with-account")
    await browser.waitForElementVisible("#sign-in-name", 10000, true)
    await browser.click(
      "#sign-in-name option[value=cosmos1ek9cd8ewgxg9w5xllq9um0uf4aaxaruvcw4v9e]"
    )
    browser.setValue("#sign-in-password", "1234567890")
    await next(browser)
    // check if signed in
    await browser.waitForElementNotPresent(".session", 10000, true)
    openMenu(browser)
    await browser.waitForElementVisible("#sign-out", 10000, true)
  },*/
  "Import local account": async function(browser) {
    prepare(browser)

    browser.click("#use-an-existing-address")
    browser.waitForElementVisible("#recover-with-backup", 10000, true)
    browser.pause(500)
    browser.click("#recover-with-backup")

    browser.waitForElementVisible("#import-seed", 10000, true)
    await next(browser)
    browser.expect.elements(".tm-form-msg--error").count.to.equal(1)
    browser.setValue(
      "#import-seed",
      `lab stable vessel rose donkey panel slim assault cause tenant level yellow sport argue rural pizza supply idea detect brass shift aunt matrix simple`
    )
    await next(browser)

    browser.waitForElementVisible("#import-name", 10000, true)
    await next(browser)
    browser.expect.elements(".tm-form-msg--error").count.to.equal(1)
    browser.setValue("#import-name", "demo-account-imported")
    await next(browser)

    browser.waitForElementVisible("#import-password", 10000, true)
    await next(browser)
    browser.expect.elements(".tm-form-msg--error").count.to.equal(1)
    browser.setValue("#import-password", "1234567890")
    await next(browser)
    browser.expect.elements(".tm-form-msg--error").count.to.equal(1)
    browser.setValue("#import-password-confirmation", "1234567890")
    await next(browser)

    // check if signed in
    browser.waitForElementNotPresent(".session", 10000, true)
    openMenu(browser)
    browser.waitForElementVisible("#sign-out", 10000, true)
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

function openMenu(browser) {
  return new Promise(resolve => {
    browser.waitForElementVisible(".open-menu", 10000, true, () => {
      browser.click(".open-menu", () => {
        resolve()
      })
    })
  })
}

async function signOut(browser) {
  return new Promise(resolve => {
    openMenu(browser).then(() => {
      browser.waitForElementVisible("#sign-out", 10000, true, () => {
        // browser click doesn't always work
        browser.execute("document.getElementById('sign-out').click()")
        resolve()
      })
    })
  })
}

function signIn(browser) {
  return new Promise(resolve => {
    openMenu(browser).then(() => {
      browser.waitForElementVisible("#sign-in", 10000, true, () => {
        browser.click("#sign-in")
        resolve()
      })
    })
  })
}

function prepare(browser) {
  browser.resizeWindow(400, 1024) // force mobile screen to be able to click some out of screen buttons
  browser.url(browser.launch_url + "?insecure=true", () => {
    browser.waitForElementVisible(`body`, 10000, true)
    browser.waitForElementVisible(`#app-content`, 10000, true, async () => {
      // check if we are already singed in
      const isSigned = await browser.execute(function() {
        const signOutElement = document.getElementById("sign-out")
        if (signOutElement) {
          return true
        }
        return false
      })
      const resolve = isSigned.value
        ? signOut(browser)
        : Promise.resolve("Success")
      await resolve.then(() => signIn(browser))
      browser.waitForElementVisible("#session-welcome", 10000, true)
    })
  })
}
