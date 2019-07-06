const puppeteer = require('puppeteer')
const expect = require('chai').expect

var browser = null
var page = null
const CRX_PATH = require('path').join(__dirname, '../../dist')
const EXTENSION_ID = 'dafekhlcpidfaopcimocbcpciholgkkb'

const signupData = {
  name: "Thanos Account",
  password: "Gamora1234",
  seedPhrase: "release endorse scale across absurd trouble climb unaware actor elite fantasy chair license word rare length business kiss smoke tackle report february bid ginger"
}


before(async () => {
  const launchOptions = { 
    headless: false,
    slowMo: 20,
    args: [
      `--disable-extensions-except=${CRX_PATH}`,
      `--load-extension=${CRX_PATH}`
    ]
  }

  browser = await puppeteer.launch(launchOptions)
  page = await browser.newPage()
  await page.setViewport({
    width: 1024,
    height: 768,
  })
})

after(async () => {
  await browser.close()
})

it('Restores an account with backup codes', async () => {
  await page.goto(`chrome-extension://${EXTENSION_ID}/popup/popup.html`)

  //FIX:trouble if other buttons are around
  await page.waitForSelector('button')
  await page.click('button')
  await page.waitForSelector('a[href="#/existing"]')
  await page.click('a[href="#/existing"]')
  await page.waitForSelector('a[href="#/recover"]')
  await page.click('a[href="#/recover"]')

  await page.type('input[placeholder="Must have at least 5 characters"]', signupData.name)
  await page.type('input[placeholder="Must be at least 10 characters"]', signupData.password)
  await page.type('input[placeholder="Enter password again"]', signupData.password)
  await page.type('textarea[placeholder="Must be exactly 24 words"]', signupData.seedPhrase)
  await page.click('div.session-footer')

  expect(await page.$('body')).to.be.ok
  // await page.screenshot({ path: '.screenshots/landing_page.png' })
})