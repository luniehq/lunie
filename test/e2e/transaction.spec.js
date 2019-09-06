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
      .setValue("input[placeholder='Enter password again']", formData.password)
      .setValue(
        "textarea[placeholder='Must be exactly 24 words']",
        formData.seedPhrase
      )
      .click('div.session-footer button')
      .assert.containsText('body', formData.name)

      //Send transaction on Lunie to extension
      .execute(function() {
        window.open('https://localhost:9080/?experimental=true/#/extension')
      })
      .pause(500)

      //Switch to Localhost
      .windowHandles(function(result) {
        browser
          .switchWindow(result.value[1])
          .pause(300)
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

          //Back to extension to approve
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
