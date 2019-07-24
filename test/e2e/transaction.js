var { globals } = require('./nightwatch.conf.js')
const formData = require('./formData.json')

module.exports = {
  'Send Transaction': function(browser) {
    browser
      //Import funded account
        .url(`chrome-extension://${globals.EXTENSION_ID}/popup/popup.html`)
        .waitForElementVisible('.tm-li-session-title')
        .click('a[href="#/recover"]')
        .pause(500)
        .setValue(
          "input[placeholder='Must have at least 5 characters']",
          formData.name
        )
        .setValue(
          "input[placeholder='Must be at least 10 characters']",
          formData.password
        )
        .setValue(
          "input[placeholder='Enter password again']",
          formData.password
        )
        .setValue(
          "textarea[placeholder='Must be exactly 24 words']",
          formData.seedPhrase
        )
        .click('div.session-footer button')
        .assert.containsText('body', formData.name)
      
      //Send transaction on Lunie to extension
      .pause(5000) //Wait for Lunie to spin up
      .execute(function() {
        window.open('https://localhost:9080/?#/transactions')
      })
      // .url(`https://localhost:9080/?#/transactions`)
      .pause(2000)

      .windowHandles(function(result) {
        browser
          .switchWindow(result.value[1])
          .assert.urlContains('https://localhost:9080/?#/transactions')
          .waitForElementVisible('body', 2000)
          // .switchWindow(result.value[0])
          .click('div.tool-bar button')
          .pause(2000)
          .click('a[href="#/existing"]')
          .pause(2000)
          .click('a[href="#/extension"]')
          .pause(2000)
          .click('li.account button')
          .click('a[href="#/wallet"]')
          .click('li.li-coin__content button')
          .setValue(
            "input[placeholder='Address']",
            'cosmos1324vt5j3wzx0xsc32mjhkrvy5gn5ef2hrwcg29'
          )
          .setValue("input[placeholder='Amount']", '1')
          .click('div.action-modal-footer button')
          .click('div.action-modal-footer button')
          .click('div.action-modal-footer button')
          .pause(2000)

          .switchWindow(result.value[0])

          .pause(20000)
      })
  }
}
