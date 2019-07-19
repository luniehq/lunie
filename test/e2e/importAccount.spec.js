var { globals } = require('./nightwatch.conf.js')
const { signupData } = require('./globals.js')

module.exports = {
  'Open extension': function(browser) {
    browser
      .url(`chrome-extension://${globals.EXTENSION_ID}/popup/popup.html`)
      .waitForElementVisible('.tm-li-session-title')
      .click('a[href="#/recover"]')
      .pause(500)
      .setValue(
        "input[placeholder='Must have at least 5 characters']",
        signupData.name
      )
      .setValue(
        "input[placeholder='Must be at least 10 characters']",
        signupData.password
      )
      .setValue(
        "input[placeholder='Enter password again']",
        signupData.password
      )
      .setValue(
        "textarea[placeholder='Must be exactly 24 words']",
        signupData.seedPhrase
      )

      .click('div.session-footer button')
      .assert.containsText('body', signupData.name)
  }
}
