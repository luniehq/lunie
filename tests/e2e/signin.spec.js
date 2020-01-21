module.exports = {
  "Sign in with local account": async function(browser) {
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
  },
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

function closeMenu(browser) {
  return new Promise(resolve => {
    browser.waitForElementVisible(".close-menu", 10000, true, () => {
      browser.click(".close-menu", () => {
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
  browser.url(browser.launch_url + "?insecure=true", async () => {
    browser.waitForElementVisible(`body`, 10000, true)
    browser.waitForElementVisible(`#app-content`, 10000, true, async () => {
      await browser.execute(function() {
        window.localStorage.setItem(
          "cosmos-wallets-index",
          JSON.stringify([
            {
              name: "demo",
              address: "cosmos1ek9cd8ewgxg9w5xllq9um0uf4aaxaruvcw4v9e"
            }
          ])
        )
        window.localStorage.setItem(
          `cosmos-wallets-cosmos1ek9cd8ewgxg9w5xllq9um0uf4aaxaruvcw4v9e`,
          JSON.stringify({
            name: `rich_account`,
            address: `cosmos1ek9cd8ewgxg9w5xllq9um0uf4aaxaruvcw4v9e`,
            wallet: `ae1d20a49e1085cca29a71e270c6f64f8f86794cb67c6922caea6bcba0ed9e60g+nSTgP8/wHpWaomDkhW/7g2Xldvno3VRFggvdpWIDrRV+n4BJtpk3UpLKo0K3SDL5dRzxz3NmGFnSA8znggFmtesdqu6jWJYzSNqaQhM/gCPTVabF7t1UHaybze1NRlYcm/wl5oOyXRpki6ugOHxNhF7+4wlzhYxMilAB7ekDB4+VVHoPMUinU4dsUdtC4XwDUA0rbX1TTmrh+i1eBp6UTQ+nHGiZXL1TkhhR1mE0fR3bLRunz5XagYtjoST33pecQWzqeaZZQ/mgm9QXu/i+ymfbnPQkh8ivx+J6/d2RfZuAV4NnwFZDUr7CzPX4TU`
          })
        )
        return true
      }, [])
      await browser.refresh()
      openMenu(browser).then(async () => {
        // check if we are already singed in
        const isSigned = await browser.execute(function() {
          return new Promise(resolve => {
            let attempts = 3
            const f = () => {
              const signOutElement = document.querySelector(
                ".user-box-address #sign-out"
              )
              const singInElement = document.querySelector(".app-menu #sign-in")
              if (!signOutElement < 2 && attempts-- > 0) {
                setTimeout(f, 2000)
                return false
              }
              if (!signOutElement && !singInElement) {
                throw new Error(`No sign-in or sign-out buttons`)
              }
              resolve(signOutElement ? true : false)
            }
            f()
          })
        })
        closeMenu(browser).then(async () => {
          const resolve = isSigned.value
            ? signOut(browser)
            : Promise.resolve("Success")
          await resolve.then(() => signIn(browser))
          browser.waitForElementVisible("#session-welcome", 10000, true)
        })
      })
    })
  })
}
