'use strict'

let { Application } = require('spectron')
let test = require('tape-promise/tape')
let electron = require('electron')
let { join } = require('path')
let { tmpdir } = require('os')

async function launch () {
  let home = join(tmpdir(), Math.random().toString(36).slice(2))
  console.error(`COSMOS_HOME: ${home}`)

  let app = new Application({
    path: electron,
    args: [ join(__dirname, '../app/dist/main.js') ],
    startTimeout: 10000,
    waitTimeout: 10000,
    env: {
      COSMOS_TEST: 'true',
      COSMOS_HOME: home
    }
  })
  await app.start()
  return app
}

let app, client
let el = (...args) => client.$(...args)

test('launch app', async function (t) {
  app = await launch()
  client = app.client
  t.ok(app.isRunning(), 'app launched')
  t.end()
})

test('wait for app to load', async function (t) {
  await client.waitForExist('.header-item-logo', 5000)
  t.pass('loaded')
  t.end()
})

test('sign in', async function (t) {
  t.test('navigate to signin', async function (t) {
    let link = el('a*=Sign In')
    await link.click()
    await client.waitUntilTextExists(
      '.ni-page-header-title',
      'Welcome to Cosmos')
    t.pass('navigated')
    t.end()
  })

  t.test('agreement', async function (t) {
    let input = 'input[placeholder="Enter here"]'
    let continueButton = 'button=Continue'
    let errorText = 'div*=Agreement must match'

    t.test('input incorrect agreement text', async function (t) {
      await el(input).setValue('lol i don\'t understand the risks')
      await el(continueButton).click()
      await client.waitForVisible(errorText)
      t.pass('error text is shown')
      t.end()
    })

    t.test('input correct agreement text', async function (t) {
      await el(input).setValue('I understand the risks')
      await el(continueButton).click()
      try {
        await el(errorText).isVisible()
        t.fail('error text should not exist')
      } catch (e) {
        t.pass('no error text')
      }
      t.end()
    })
    t.end()
  })

  t.test('seed', async function (t) {
    let input = 'input[placeholder="Input seed..."]'
    let signInButton = 'button=Sign In'

    // TODO (after seed validation implemented)
    t.skip('input incorrect seed text', async function (t) {
      await el(input).setValue('seed123')
      await el(signInButton).click()
      let errorText = 'div*=TODO: add error message'
      t.ok(await el(errorText).isVisible(), 'error is shown')
      t.end()
    })

    t.test('input correct agreement text', async function (t) {
      await el(input).setValue('TODO: put valid seed here')
      await el(signInButton).click()
      await client.waitUntilTextExists(
        '.ni-page-header-title',
        'Balances')
      t.pass('navigated')
      t.end()
    })
    t.end()
  })
  t.end()
})

test.onFinish(() => app.stop())
