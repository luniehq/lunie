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
        window.open('https://localhost:9080/?experimental=t/#/wallet')
      })
      .pause(500)

      //Switch to Localhost
      .windowHandles(function(result) {
        browser
          .switchWindow(result.value[1])
          .pause(3000)
          .assert.urlContains('https://localhost:9080/?experimental=t/#/wallet')
          .waitForElementVisible('body', 3000)
          .click('div.tool-bar button')
          .pause(300)
          .click('a[href="#/existing"]')
          .pause(300)
          .click('a[href="#/extension"]')
          .pause(300)
          .click('li.account button')
          .pause(300)
          .click('a[href="#/staking"]')
          .pause(300)
          .click('a[href="#/staking/validators"]')
          .pause(500)
          .click('a.data-table__row__info__container__name')
          .pause(500)
          .click('#delegation-btn')
          .pause(500)
          .setValue("input[placeholder='Amount']", '1')
          .click('div.action-modal-footer button')
          .pause(500)
          .click('div.action-modal-footer button')
          .pause(500)
          .click('div.action-modal-footer button')
          .pause(500)

          //Back to extension to approve
          .switchWindow(result.value[0])
          .refresh()
          .pause(500)
          .setValue("input[placeholder='Password']", formData.password)
          .click('#approve-btn')
          .assert.containsText('body', 'Transaction Complete')
          .switchWindow(result.value[1])
          .pause(6000)
          .assert.containsText('body', 'Successful delegation!')
          .end()
      })
  }
}
