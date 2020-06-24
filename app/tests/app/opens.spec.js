describe("App opens", function () {
  it("shows something", function () {
    browser.waitForVisible("#app-content", 30000)
  })
})
