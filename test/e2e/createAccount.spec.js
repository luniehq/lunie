var { globals } = require('./nightwatch.conf.js')
const formData = require('./formData.json')

/* module.exports = {
  'Create Account': function(browser) {
    browser
      .pause(500)
      .url(`chrome-extension://${globals.EXTENSION_ID}/popup/popup.html`)
      .waitForElementVisible('a[href="#/create"]')
      .click('a[href="#/create"]')
      .pause(500)
      .setValue(
        "input[placeholder='Must be at least 5 characters']",
        formData.name2
      )
      .setValue(
        "input[placeholder='Must be at least 10 characters']",
        formData.password
      )
      .setValue("input[placeholder='Enter password again']", formData.password)
      .click('div.field-checkbox-input label')
      .click('div.session-footer button')
      .assert.containsText('body', formData.name2)
  }
} */

module.exports = {
  'Create Account': function(browser) {
    browser
      .pause(500)
      .url(`chrome-extension://${globals.EXTENSION_ID}/popup/popup.html`)
      .waitForElementVisible('a[href="#/create"]')
      .click('a[href="#/create"]')
      .pause(500)
      // Name
      .setValue(
        "input[placeholder='Must be at least 5 characters']",
        formData.name
      )
      .click('div.session-footer button')
      // Password
      .setValue(
        "input[placeholder='Must be at least 10 characters']",
        formData.password
      )
      .setValue("input[placeholder='Enter password again']", formData.password)
      .click('div.session-footer button')
      // Seed
      .click('input')
      .click('div.session-footer button')
      // Confirm
      .assert.containsText('body', 'Your account has been created')
  }
}
