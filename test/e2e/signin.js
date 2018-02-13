let test = require('tape-promise/tape')
let launchApp = require('./launch.js')
let { navigate } = require('./common.js')

test('sign in', async function (t) {
  let app, client
  let el = (...args) => client.$(...args)

  app = await launchApp(t)
  console.log('app launched')
  client = app.client

  navigate(t, client, 'Sign In', 'Welcome to Cosmos Voyager')

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

    t.test('input correct seed text', async function (t) {
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
