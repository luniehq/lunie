let { spawn, spawnSync } = require('child_process')
let test = require('tape-promise/tape')
let launchApp = require('./launch.js')
let { navigate, newTempDir, waitForText } = require('./common.js')

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
      child.once('exit', () => t.end())
    })
  })

  t.test('recover basecli test key', function (t) {
    let child = spawn('basecli', [
      'keys', 'recover', 'testkey',
      '--home', home
    ])
    child.stdin.write('1234567890\n')
    child.stdin.write('chair govern physical divorce tape movie slam field gloom process pen universe allow pyramid private ability\n')
    child.once('exit', () => t.end())
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

function cliQueryAccount (home, address) {

}

test('wallet', async function (t) {
  let app, client
  let $ = (...args) => client.$(...args)
  app = await launchApp(t)
  client = app.client

  let cliHome = newTempDir()
  console.error(`basecli home: ${cliHome}`)
  cliInit(t, cliHome)

  navigate(t, client, 'Balances')

  let address

  t.test('address', async function (t) {
    let addressEl = $('div=Address').$('..').$('div.ni-li-dd')
    address = await addressEl.getText()
    t.ok(address, `address: ${address}`)
    t.ok(address.length, 40, 'address is correct length')
    t.end()
  })

  t.test('no mycoin balance yet', async function (t) {
    let mycoinEl = $('div=MYCOIN').$('..').$('div.ni-li-dd')
    let balance = await mycoinEl.getText()
    t.equal(balance, '0', 'mycoin balance is 0')
    t.end()
  })

  t.test('receive mycoin', async function (t) {
    await cliSendCoins(cliHome, address, '1000mycoin')
    t.end()
  })

  t.test('mycoin balance is shown', async function (t) {
    let mycoinEl = () => $('div=MYCOIN').$('..').$('div.ni-li-dd')
    await waitForText(mycoinEl, '1000', 8000)
    t.pass('received mycoin transaction')
    t.end()
  })

  t.end()
})
