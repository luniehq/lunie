var { globals } = require('./nightwatch.conf.js')
const signupData = require('./globals.json')

module.exports = {
  'Create Account': function(browser) {
    browser
      .pause(3000) //Wait for Lunie to spin up

      .url(`chrome-extension://${globals.EXTENSION_ID}/popup/popup.html`)
      .waitForElementVisible('a[href="#/create"]')
      .click('a[href="#/create"]')
      .pause(500)
      .setValue(
        "input[placeholder='Must be at least 5 characters']",
        signupData.name2
      )
      .setValue(
        "input[placeholder='Must be at least 10 characters']",
        signupData.password
      )
      .setValue(
        "input[placeholder='Enter password again']",
        signupData.password
      )
      .click('div.field-checkbox-input label')
      .click('div.session-footer button')
      .assert.containsText('body', signupData.name2)
  }
}
