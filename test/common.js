module.exports = {
  navigate (t, client, linkText, titleText = linkText) {
    t.test(`navigate to "${linkText}"`, async function (t) {
      await client.$(`a*=${linkText}`).click()
      await client.waitUntilTextExists('.ni-page-header-title', titleText)
      t.pass(`navigated to "${linkText}"`)
      t.end()
    })
  }
}
