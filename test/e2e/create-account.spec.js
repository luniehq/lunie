const puppeteer = require('puppeteer')
const { EXTENSION_ID, signupData, launchOptions } = require('./globals.js')

let browser = null
let page = null

beforeAll(async () => {
  browser = await puppeteer.launch(launchOptions)
  page = await browser.newPage()
  await page.goto(`chrome-extension://${EXTENSION_ID}/popup/popup.html`, {
    waitUntil: 'networkidle2'
  })
  jest.setTimeout(20000)
})

afterAll(async () => {
  await browser.close()
})

test('Restores an account with backup code when has no accounts', async () => {
  //click "Recover with backup code"
  await page.waitForSelector("a[href='#/recover']")
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
  await page.click('div.session-footer button')
  const accountRenders = await page.$eval('h3', el => el.textContent)
  expect(accountRenders).toEqual(signupData.name)

  //needs better check once account is accessible
  expect(await page.$('body')).toBeTruthy()
})
