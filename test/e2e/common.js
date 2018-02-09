let { tmpdir } = require('os')
let { join } = require('path')

function sleep (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

module.exports = {
  async openMenu (client) {
    // close notifications as they overlay the menu button 
    while (await client.isExisting(`.ni-notification`)) { 
      await client.$(`.ni-notification`).click() 
    } 
    await client.$('#app-menu-button').click() 
    await client.$('.app-menu').isVisible()
  },
  async navigate (t, client, linkText, titleText = linkText) {
    await module.exports.openMenu(client)
    // click link 
    await client.$(`a*=${linkText}`).click()
    await client.waitUntilTextExists('.ni-page-header-title', titleText)
    console.log(`navigated to "${linkText}"`)
  },
  newTempDir () {
    return join(tmpdir(), Math.random().toString(36).slice(2))
  },
  sleep,
  async waitForText (elGetterFn, text, timeout = 5000) {
    let start = Date.now()
    while (await elGetterFn().getText() !== text) {
      if (Date.now() - start >= timeout) {
        throw Error('Timed out waiting for text')
      }
      await sleep(100)
    }
  },
  async login (client, account = 'testkey') {
    console.log('logging into ' + account)
    let accountsSelect = '#sign-in-name select'

    await selectOption(client, accountsSelect, account)

    await client.$('#sign-in-password').setValue('1234567890')
    await client.$('.ni-session-footer button').click()
    await client.waitForExist('#app-content', 5000)

    // let address = await client.$('.ni-li-copy .value').getText()
    // TODO check if correct account logged in
  },
  async logout (client) {
    console.log('logging out')
    await module.exports.openMenu(client)

    await client.$('.ni-li-user').click()
    await client.$('.material-icons=exit_to_app').$('..').click()
  }
}

// only sending keyboard arrows worked for selecting options
async function selectOption (client, selectSelector, text) {
  // go up to the first option
  await client.$(selectSelector).click()
  await client.keys(['\uE013', '\uE013', '\uE013', '\uE013', '\uE013', '\uE013']) // TODO calc options length
  // then go down until we have the option we want
  let found = false
  while (!found) {
    let value = (await client.$(selectSelector).getValue()).trim()
    found = text === value
    if (!found) {
      await client.$(selectSelector).click()
      await client.keys(['\uE015'])
    }
  }
}
