let { tmpdir } = require('os')
let { join } = require('path')

function sleep (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

module.exports = {
  async navigate (t, client, linkText, titleText = linkText) {
    // close notifications as they overlay the menu button 
    while (await client.isExisting(`.ni-notification`)) { 
      await client.$(`.ni-notification`).click() 
    } 
    // open menu 
    await client.$('#app-menu-button').click() 
    await client.$('.app-menu').isVisible()
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
  }
}
