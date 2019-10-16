var { globals } = require('./nightwatch.conf.js')
const formData = require('./formData.json')

module.exports = {
  'Send Transaction': function(browser) {
    browser
      // Import funded account
      .pause(500)
      .url(`chrome-extension://${globals.EXTENSION_ID}/popup/popup.html`)
      .waitForElementVisible('a[href="#/create"]')
      .click('a[href="#/create"]')
      .pause(500)
      // Name
      .waitForElementVisible('h2.session-title')
      .setValue(
        "input[placeholder='Must be at least 5 characters']",
        formData.name
      )
      .click('div.session-footer button')
      .pause(500)
      // Password
      .waitForElementVisible('h2.session-title')
      .setValue(
        "input[placeholder='Must be at least 10 characters']",
        formData.password
      )
      .setValue("input[placeholder='Enter password again']", formData.password)
      .click('div.session-footer button')
      .pause(500)
      // Seed
      .waitForElementVisible('h2.session-title')
      .click('div.field-checkbox-input label')
      .pause(500)
      .click('div.session-footer button')
      .pause(500)
      // Confirm
      .waitForElementVisible('h2.session-title')
      .assert.containsText('body', 'Your account has been created')

      // Send transaction on Lunie to extension
      .execute(function() {
        window.open('https://localhost:9080/?experimental=true/#/extension')
      })
      .pause(500)

      // Switch to Localhost
      .windowHandles(function(result) {
        browser
          .switchWindow(result.value[1])
          .pause(500)
          .assert.urlContains(
            'https://localhost:9080/?experimental=true/#/extension'
          )
          .waitForElementVisible('li.account button')
          .click('li.account button')
          .waitForElementNotPresent('.session')

          // Perform a token send
          .click('a[href="#/portfolio"]')
          .click('.send-button')
          .setValue(
            "input[placeholder='Address']",
            'cosmos1akhswynqs07zj5p2k25r6s4ur45qyjnr30wt59'
          )
          .setValue("input[placeholder='Amount']", '1')
          .click('div.action-modal-footer button')
          .click('div.action-modal-footer button')
          .click('div.action-modal-footer button')

          // Back to extension to approve
          .switchWindow(result.value[0])
          .refresh()
          .setValue("input[placeholder='Password']", formData.password)
          .click('#approve-btn')
          .assert.containsText('body', 'Transaction Complete')
          .switchWindow(result.value[1])
        browser.expect
          .element('body')
          .text.to.contain('Successful Send')
          .before(10000)
      })
  }
}
