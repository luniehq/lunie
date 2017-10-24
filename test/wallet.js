let { spawn } = require('child_process')
let test = require('tape-promise/tape')
let launchApp = require('./launch.js')
let { navigate, newTempDir, waitForText, sleep } = require('./common.js')

function cliInit (t, home) {
  t.test('basecli init', function (t) {
    let child = spawn('basecli', [
      'init',
      '--home', home,
      '--chain-id', 'localtestnet',
      '--node', 'localhost:46657'
    ])
    child.stdout.once('data', () => {
      child.stdin.write('y\n')
      child.once('exit', (code) => {
        t.equal(code, 0, 'exited with exit code 0')
        t.end()
      })
    })
  })

  t.test('recover basecli test key', function (t) {
    let child = spawn('basecli', [
      'keys', 'recover', 'testkey',
      '--home', home
    ])
    child.stdin.write('1234567890\n')
    child.stdin.write('chair govern physical divorce tape movie slam field gloom process pen universe allow pyramid private ability\n')
    child.once('exit', (code) => {
      t.equal(code, 0, 'exited with exit code 0')
      t.end()
    })
  })
}

function cliSendCoins (home, to, amount) {
  let child = spawn('basecli', [
    'tx', 'send',
    '--name', 'testkey',
    '--to', to,
    '--amount', amount,
    '--home', home
  ])
  child.stdin.write('1234567890\n')
  return new Promise((resolve, reject) => {
    child.once('error', reject)
    child.once('exit', resolve)
  })
}

test('wallet', async function (t) {
  let app, client
  let $ = (...args) => client.$(...args)
  app = await launchApp(t)
  client = app.client

  let cliHome = newTempDir()
  console.error(`basecli home: ${cliHome}`)
  cliInit(t, cliHome)

  let balanceEl = (denom) =>
    $(`div=${denom.toUpperCase()}`)
      .$('..')
      .$('div.ni-li-dd')

  t.test('receive', async function (t) {
    navigate(t, client, 'Balances')

    let address
    t.test('address', async function (t) {
      let addressEl = $('div=Address').$('..').$('div.ni-li-dd')
      address = await addressEl.getText()
      t.ok(address, `address: ${address}`)
      t.equal(address.length, 40, 'address is correct length')
      t.end()
    })

    t.test('mycoin balance before receiving', async function (t) {
      let mycoinEl = balanceEl('mycoin')
      let balance = await mycoinEl.getText()
      t.equal(balance, '0', 'mycoin balance is 0')
      t.end()
    })

    t.test('receive mycoin', async function (t) {
      await cliSendCoins(cliHome, address, '1000mycoin')
      t.end()
    })

    t.test('mycoin balance after receiving', async function (t) {
      let mycoinEl = () => balanceEl('mycoin')
      await waitForText(mycoinEl, '1000', 8000)
      t.pass('received mycoin transaction')
      t.end()
    })

    t.end()
  })

  t.test('send', async function (t) {
    navigate(t, client, 'Send', 'Send Coins')

    let sendBtn = () => $('button=Send Now')
    let addressInput = () => $('#send-address')
    let amountInput = () => $('#send-amount')
    let denomBtn = (denom) => $(`button=${denom.toUpperCase()}`)

    t.test('hit send with empty form', async function (t) {
      await sendBtn().click()
      t.equal(await sendBtn().getText(), 'Send Now', 'not sending')
      t.end()
    })

    t.test('address w/ less than 40 chars', async function (t) {
      await addressInput().setValue('012345')
      await $('div=Address must be exactly 40 characters').waitForExist()
      t.pass('got correct error message')
      await sendBtn().click()
      t.equal(await sendBtn().getText(), 'Send Now', 'not sending')
      t.end()
    })

    t.test('address w/ 40 chars', async function (t) {
      await addressInput().setValue('0'.repeat(40))
      t.notOk(await client.isExisting('div=Address must be exactly 40 characters'), 'no error message')
      await sendBtn().click()
      t.equal(await sendBtn().getText(), 'Send Now', 'not sending')
      t.end()
    })

    t.test('amount set', async function (t) {
      await amountInput().setValue('100')
      await sendBtn().click()
      t.equal(await sendBtn().getText(), 'Send Now', 'not sending')
      // await $('div=Denomination is required').waitForExist()
      // t.pass('got correct error message')
      t.end()
    })

    t.test('denom set', async function (t) {
      await denomBtn('mycoin').click()
      await sleep(100)
      await sendBtn().click()
      t.end()
    })

    navigate(t, client, 'Balances')

    t.test('own balance updated', async function (t) {
      let mycoinEl = () => balanceEl('mycoin')
      await waitForText(mycoinEl, '900')
      t.pass('balance is now 900')
      t.end()
    })

    t.end()
  })

  t.end()
})
