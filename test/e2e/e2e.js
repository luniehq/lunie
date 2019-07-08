/*
  NOTE: Add to dst/manifest.json:
    "key": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvWWKi8PPH3u+bDCFJWTyvCwc9+kUt1l3WBt9vd3cQY7dpmEWGmFaeTNLLVWEE6+cwcUl4sOS9Jgj3J+svRtK8+CupAjL5RMRUh3v9amRZ4Gn0QT+x8K4Cg+KN+3fP6YnTw/QQI0laU2oEIpDbltuYz8x7zcZgmVtAeCo+55YNuR4q1hfc/ciSH5/wvkBplP8D0h4bhNAHNFUwmr39mTBhprr4KocMez09QcDIj7/5XGcaprLf0HpQx1rxD05ajxjUuM266Xz6uy5u6TvnqQoYZmPNo0zJoJIPiJ/qL+McQ6H8FzDs3Lhjv3OePbA+TOyx8uOCG0gNnyHlRAP5uPVzQIDAQAB"
*/
const puppeteer = require('puppeteer')
const expect = require('chai').expect
const { EXTENSION_ID, signupData, launchOptions } = require('./globals.js')

let browser = null
let page = null

before(async () => {
  browser = await puppeteer.launch(launchOptions)
  page = await browser.newPage()
  await page.goto(`chrome-extension://${EXTENSION_ID}/popup/popup.html`, {
    waitUntil: 'networkidle2'
  })
})

after(async () => {
  await browser.close()
})

it('Restores an account with backup codes', async () => {
  //click "Add Account"
  await page.waitForSelector('button')
  await page.click('button')

  //click "Use an Existing Address"
  await page.waitForSelector("a[href='#/existing']")
  await page.click("a[href='#/existing']")

  //click "Recover with backup code"
  await page.waitForSelector("a[href='#/recover']", { visible: true })
  await page.waitFor(300)
  await page.click("a[href='#/recover']")

  //enter account information and click next
  await page.waitForSelector(
    "input[placeholder='Must have at least 5 characters']"
  )
  await page.type(
    "input[placeholder='Must have at least 5 characters']",
    signupData.name
  )
  await page.type(
    "input[placeholder='Must be at least 10 characters']",
    signupData.password
  )
  await page.type(
    "input[placeholder='Enter password again']",
    signupData.password
  )
  await page.type(
    "textarea[placeholder='Must be exactly 24 words']",
    signupData.seedPhrase
  )
  await page.click('div.session-footer')

  //needs better check once account is accessible
  expect(await page.$('body')).to.be.ok
})
