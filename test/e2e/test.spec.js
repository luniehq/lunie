module.exports = {
  url: `http://localhost:8081`,
  'Demo test' : function (browser) {
    browser
      .url(this.url)
      .waitForElementVisible(`body`)
      .waitForElementVisible(`#app-content`)
      .end();
  }
};
    