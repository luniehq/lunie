module.exports = {
  url: `http://localhost:8081`,
  'Demo test' : function (browser) {
    browser.pause( 1000 )
    browser
      .url(browser.launch_url)
      .waitForElementVisible(`body`)
      .waitForElementVisible(`#app-content`)
      // demo to show that account is setup
      .execute(function() {
        return window.localStorage.getItem(`keys`)
      }, [], function(result) {
        console.log(result)
      })
      .end()
  }
}
