var config = require('./nightwatch.conf.js')

module.exports = {
  'Open extension': function(browser) {

    browser.url('chrome-extension://cklkpejioojjeiigffappdlcmnonmjek/popup/popup.html')
    browser.pause(5000)

    // prepare(browser)

    // browser.click("#use-an-existing-address")
    // browser.waitForElementVisible("#sign-in-with-account")
    // browser.click("#sign-in-with-account")
  }
}
