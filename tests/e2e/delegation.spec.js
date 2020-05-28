const {
  actionModalCheckout,
  waitForText,
  getAccountBalance,
  getLastActivityItemHash,
  waitForHashUpdate,
} = require("./helpers.js")

async function setSelect(browser, selector, option) {
  await browser.execute(
    function (selector, option) {
      const select = document.querySelector(selector)
      select.value = option

      // Create a new 'change' event
      var event = new Event("input")

      // Dispatch it.
      select.dispatchEvent(event)
    },
    [selector, option]
  )
}

module.exports = {
  "Delegate Action": async function (browser) {
    await browser.url(
      browser.launch_url + browser.globals.slug + "/transactions"
    )
    const lastHash = await getLastActivityItemHash(browser)

    // move to according page
    await browser.url(browser.launch_url + browser.globals.slug + "/validators")
    // move to validator page
    await browser.expect.element(".li-validator").to.be.visible.before(30000)
    await browser.click(
      `.li-validator[data-name="${browser.globals.validatorOneName}"]`
    )
    const value = browser.globals.stakeAmount
    await actionModalCheckout(
      browser,
      "#delegation-btn",
      // actions to do on details page
      () => {
        browser.setValue("#amount", value)
      },
      value,
      0,
      value
    )
    await getAccountBalance(browser)
    // check if the hash is changed
    await browser.url(
      browser.launch_url + browser.globals.slug + "/transactions"
    )
    // check if tx shows
    await waitForText(
      browser,
      ".tx:nth-of-type(1) .tx__content .tx__content__left h3",
      `Staked`
    )
    await waitForText(
      browser,
      ".tx:nth-of-type(1) .tx__content .tx__content__right .amount",
      `${value} ${browser.globals.denom}`
    )

    await waitForHashUpdate(browser, lastHash)
  },
  "Redelegate Action": async function (browser) {
    await browser.url(
      browser.launch_url + browser.globals.slug + "/transactions"
    )
    const lastHash = await getLastActivityItemHash(browser)

    // move to validator page
    await browser.url(browser.launch_url + browser.globals.slug + "/validators")
    browser.expect.element(".li-validator").to.be.visible.before(30000)
    await browser.click(
      `.li-validator[data-name="${browser.globals.validatorTwoName}"]`
    )
    const value = browser.globals.restakeAmount
    await actionModalCheckout(
      browser,
      "#delegation-btn",
      // actions to do on details page
      async () => {
        await setSelect(browser, "#from select", "1")
        await browser.waitForElementVisible(".action-modal-title", 30000)
        await waitForText(browser, ".action-modal-title", `Restake`)
        browser.setValue("#amount", value)
      },
      // expected subtotal
      "0"
    )
    await getAccountBalance(browser)

    // check if tx shows
    // check if the hash is changed
    await browser.url(
      browser.launch_url + browser.globals.slug + "/transactions"
    )
    await waitForText(
      browser,
      ".tx:nth-of-type(1) .tx__content .tx__content__left h3",
      `Restaked`
    )
    await waitForText(
      browser,
      ".tx:nth-of-type(1) .tx__content .tx__content__right .amount",
      `${value} ${browser.globals.denom}`
    )

    await waitForHashUpdate(browser, lastHash)
  },
  "Undelegate Action": async function (browser) {
    await browser.url(
      browser.launch_url + browser.globals.slug + "/transactions"
    )
    const lastHash = await getLastActivityItemHash(browser)

    // be sure that the balance has updated, if we don't wait, the baseline (balance) shifts
    //await nextBlock(browser)

    // move to according page
    await browser.url(browser.launch_url + browser.globals.slug + "/validators")

    // move to validator page
    browser.expect.element(".li-validator").to.be.visible.before(30000)
    await browser.click(
      `.li-validator[data-name="${browser.globals.validatorOneName}"]`
    )

    const value = browser.globals.restakeAmount
    await actionModalCheckout(
      browser,
      "#undelegation-btn",
      // actions to do on details page
      async () => {
        await browser.setValue("#amount", value)
      },
      // expected subtotal
      "0"
    )
    await getAccountBalance(browser)

    // check if tx shows
    await browser.url(
      browser.launch_url + browser.globals.slug + "/transactions"
    )
    await waitForText(
      browser,
      ".tx:nth-of-type(1) .tx__content .tx__content__left h3",
      `Unstaked`
    )
    await waitForText(
      browser,
      ".tx:nth-of-type(1) .tx__content .tx__content__right .amount",
      `${value} ${browser.globals.denom}`
    )

    await waitForHashUpdate(browser, lastHash)
  },
}
