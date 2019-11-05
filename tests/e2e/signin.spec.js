module.exports = {
  "Sign in with local account": async function(browser) {
    prepare(browser)

    browser.click("#use-an-existing-address")
    browser.expect("#sign-in-with-account").to.be.visible.before(10000)
    browser.pause(500)
    browser.click("#sign-in-with-account")
    browser.expect("#sign-in-name").to.be.visible.before(10000)
    browser.click(
      "#sign-in-name option[value=cosmos1ek9cd8ewgxg9w5xllq9um0uf4aaxaruvcw4v9e]"
    )
    browser.setValue("#sign-in-password", "1234567890")
    await next(browser)
    // check if signed in
    browser.expect(".session").to.be.present.before(10000)
    openMenu(browser)
    browser.expect("#sign-out").to.be.visible.before(10000)
  },
  "Create local account": async function(browser) {
    prepare(browser)

    browser.click("#creat-new-address")
    browser.expect(".seed-table").to.be.visible.before(10000)
    browser.expect
      .element(".seed-table")
      .value.to.match(/\w+( \w+){23}/)
      .before(10000)

    await next(browser)
    browser.expect.elements(".tm-form-msg--error").count.to.equal(3)

    browser.setValue("#sign-up-name", "demo-account")
    await next(browser)
    browser.expect.elements(".tm-form-msg--error").count.to.equal(2)

    browser.setValue("#sign-up-password", "1234567890")
    await next(browser)
    browser.expect
      .elements(".tm-form-msg--error")
      // the error on the initial password vanishes but the password confirmation appears
      .count.to.equal(2)

    browser.setValue("#sign-up-password-confirm", "1234567890")
    await next(browser)
    browser.expect.elements(".tm-form-msg--error").count.to.equal(1)

    browser.click("#sign-up-warning")
    await next(browser)
    // check if signed in
    browser.expect(".session").to.be.present.before(10000)
    openMenu(browser)
    browser.expect("#sign-out").to.be.visible.before(10000)
  },
  "Import local account": async function(browser) {
    prepare(browser)

    browser.click("#use-an-existing-address")
    browser.expect("#recover-with-backup").to.be.visible.before(10000)
    browser.pause(500)
    browser.click("#recover-with-backup")
    browser.expect("#import-seed").to.be.visible.before(10000)

    await next(browser)
    browser.expect.elements(".tm-form-msg--error").count.to.equal(3)

    browser.setValue("#import-name", "demo-account-imported")
    await next(browser)
    browser.expect.elements(".tm-form-msg--error").count.to.equal(2)

    browser.setValue("#import-password", "1234567890")
    await next(browser)
    browser.expect
      .elements(".tm-form-msg--error")
      // the error on the initial password vanishes but the password confirmation appears
      .count.to.equal(2)

    browser.setValue("#import-password-confirmation", "1234567890")
    await next(browser)
    browser.expect.elements(".tm-form-msg--error").count.to.equal(1)

    browser.setValue(
      "#import-seed",
      `lab stable vessel rose donkey panel slim assault cause tenant level yellow sport argue rural pizza supply idea detect brass shift aunt matrix simple`
    )
    await next(browser)
    // check if signed in
    browser.expect(".session").to.be.present.before(10000)
    openMenu(browser)
    browser.expect("#sign-out").to.be.visible.before(10000)
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
  browser.expect(".open-menu").to.be.visible.before(10000)
  browser.pause(500)
  browser.click(".open-menu")
}

function signOut(browser) {
  openMenu(browser)
  browser.expect("#sign-out").to.be.visible.before(10000)
  browser.click("#sign-out")
}

function signIn(browser) {
  openMenu(browser)
  browser.expect("#sign-in").to.be.visible.before(10000)
  browser.click("#sign-in")
}

function prepare(browser) {
  browser.resizeWindow(400, 1024) // force mobile screen to be able to click some out of screen buttons
  browser.url(browser.launch_url)
  browser.expect(`body`).to.be.visible.before(10000)
  browser.expect(`#app-content`).to.be.visible.before(10000)
  signOut(browser)
  signIn(browser)

  browser.expect("#session-welcome").to.be.visible.before(10000)
}
