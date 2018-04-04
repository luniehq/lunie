let { tmpdir } = require('os')
let { join } = require('path')

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

module.exports = {
  async closeNotifications(client) {
    // close notifications as they overlay the menu button
    await sleep(100)
    while (await client.isExisting(`.ni-notification`)) {
      await client.$(`.ni-notification`).click()
      await sleep(100)
    }
  },
  async openMenu(client) {
    console.log('opening menu')
    if (await client.isExisting('.app-menu')) {
      return
    }
    await module.exports.closeNotifications(client)
    await client.waitForExist('.material-icons=menu', 1000)
    await sleep(100)
    await client.$('.material-icons=menu').click()
    await client.waitForExist('.app-menu', 1000)
  },
  async closeMenu(client) {
    console.log('closing menu')
    if (!(await client.isExisting('.app-menu', ))) {
      return
    }
    await client.waitForExist('.material-icons=close', 1000)
    await client.$('.material-icons=close').click()
    await client.waitForExist('.app-menu', 1000, true)
  },
  async navigate(client, linkText, titleText = linkText) {
    await module.exports.openMenu(client)
    // click link
    await client.$(`a*=${linkText}`).click()
    await client.waitUntilTextExists('.ni-page-header-title', titleText)
    console.log(`navigated to "${linkText}"`)
  },
  newTempDir() {
    return join(tmpdir(), Math.random().toString(36).slice(2))
  },
  sleep,
  async waitForText(elGetterFn, text, timeout = 5000) {
    let start = Date.now()
    while (await elGetterFn().getText() !== text) {
      if (Date.now() - start >= timeout) {
        throw Error('Timed out waiting for text')
      }
      await sleep(100)
    }
  },
  async login(client, account = 'testkey') {
    console.log('logging into ' + account)
    let accountsSelect = '#sign-in-name select'

    await client.waitForExist(accountsSelect, 5000)
    await selectOption(client, accountsSelect, account)

    await client.$('#sign-in-password').setValue('1234567890')
    await client.$('.ni-session-footer button').click()
    await client.waitForExist('#app-content', 5000)

    // checking if user is logged in
    await module.exports.openMenu(client)
    let activeUser = await client.$('.ni-li-user .ni-li-title').getText()
    if (account !== activeUser) {
      throw new Error('Incorrect user logged in')
    }
  },
  async logout(client) {
    console.log('logging out')
    if (await client.isExisting('.ni-li-session')) {
      return
    }
    await closeMenu(client)
    await client.waitForExist('.material-icons=exit_to_app', 1000)
    await client.$('.material-icons=exit_to_app').click()
  }
}

async function selectOption(client, selectSelector, text) {
  await client.$(selectSelector).click()
  await client.keys(text.split())
}
