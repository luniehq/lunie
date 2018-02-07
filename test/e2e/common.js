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
    t.test(await client.$('.app-menu').isVisible(), 'menu opened') 
    // click link 
    t.test(`navigate to "${linkText}"`, async function (t) {
      await client.$(`a*=${linkText}`).click()
      await client.waitUntilTextExists('.ni-page-header-title', titleText)
      t.pass(`navigated to "${linkText}"`)
      t.end()
    })
  },
  newTempDir () {
    return join(tmpdir(), Math.random().toString(36).slice(2))
  },
  sleep,
  async waitForText (el, text, timeout = 5000) {
    let start = Date.now()
    while (await el().getText() !== text) {
      if (Date.now() - start >= timeout) {
        throw Error('Timed out waiting for text')
      }
      await sleep(100)
    }
  }
}
