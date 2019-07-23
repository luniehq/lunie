var { globals } = require('./nightwatch.conf.js')
const formData = require('./formData.json')

module.exports = {
  'Import Account': function(browser) {
    browser
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
  }
}
