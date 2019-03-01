module.exports = {
  url: `http://localhost:8081`,
  'Demo test' : function (browser) {
    browser
      .url(browser.launch_url)
      .waitForElementVisible(`body`)
      .waitForElementVisible(`#app-content`)
      .end();
  }
};
    