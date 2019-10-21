var { globals } = require('./nightwatch.conf.js')
const formData = require('./formData.json')

module.exports = {
  'Import Account': function(browser) {
    browser
      .url(`chrome-extension://${globals.EXTENSION_ID}/popup/popup.html`)
      .waitForElementVisible('.tm-li-session-title')
      .click('a[href="#/recover"]')
      .pause(500)
      // Seed
      .waitForElementVisible('h2.session-title')
      .setValue(
        "textarea[placeholder='Must be exactly 24 words']",
        formData.seedPhrase
      )
      .click('div.session-footer button')
      .pause(500)
      // Name
      .waitForElementVisible('h2.session-title')
      .setValue(
        "input[placeholder='Must have at least 3 characters']",
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
      // Assert
      .assert.containsText(
        'body',
        'You can use the account(s) below to explore Lunie.io and to approve transactions'
      )
  }
}
