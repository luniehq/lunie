/*
NOTE:
Add to dst/manifest.json:
  "key": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmFh+Ts/tyjeI6tbH9oWZfw6kSoPGxw/o9JE0DXcu4aM0He6j9FLDRfJPwBxXFhQQ4jt0ZO/wsMdqgt5W26bNCK0sL+QYN+Yr4yXfIH34LH9M3ETk7TTfhFLDyNDslQ1SZlqSbZ74UfRh5sCUmv3/xg9mj+DBCecNd+lZYAQSUKu1L3eyiRn7AYsBGTZel0+3s+DxstcLXb5w6FPx3exQikEaErvKwkwMh6LXqLqkLa/5z83MHpufPWHe4Az81sEdBNrVFZ1tZ/5/PORhvfGkRo5RjVlE2t9wcmjdYoSH2CWkhCqbmTrACWbz9RIrsdxqbzaggdSegtG8b/yOUuZE0QIDAQAB"
This is the PEM key for IOV that hard codes the extension id to be: dafekhlcpidfaopcimocbcpciholgkkb for testing otherwise a new id is generated everytime based on the file location on the machine
Todo: generate Lunie PEM.
*/

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
    slowMo: 5,
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

  await page.goto(`chrome-extension://${EXTENSION_ID}/popup/popup.html`)

})

after(async () => {
  await browser.close()
})

it('Restores an account with backup codes', async () => {

  //FIX: only clicks the first button
  await page.waitForSelector('button')
  await page.click('button')

  await page.waitForSelector('a[href="#/existing"]')
  await page.click('a[href="#/existing"]')

  await page.waitForSelector('a[href="#/recover"]', { visible: true })
  await page.waitFor(300)
  await page.click('a[href="#/recover"]')

  await page.waitForSelector('input[placeholder="Must have at least 5 characters"]')
  await page.type('input[placeholder="Must have at least 5 characters"]', signupData.name)
  await page.type('input[placeholder="Must be at least 10 characters"]', signupData.password)
  await page.type('input[placeholder="Enter password again"]', signupData.password)
  await page.type('textarea[placeholder="Must be exactly 24 words"]', signupData.seedPhrase)
  await page.click('div.session-footer')


  //Todo: check more precisely that the final account has been loaded.
  
  expect(await page.$('body')).to.be.ok
  // await page.screenshot({ path: '.screenshots/landing_page.png' })
})