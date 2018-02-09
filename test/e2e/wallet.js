let { spawn } = require('child_process')
let test = require('tape-promise/tape')
let launchApp = require('./launch.js')
let { navigate, newTempDir, waitForText, sleep, login, logout } = require('./common.js')

let binary = process.env.BINARY_PATH

function cliSendCoins (home, to, amount) {
  let child = spawn(binary, [
    'client', 'tx', 'send',
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
  let {app, home} = await launchApp(t)
  let client = app.client
  let $ = (...args) => client.$(...args)
  
  let balanceEl = (denom) =>
    $(`//div[contains(text(), "${denom.toUpperCase()}")]`)
      .$('..')
      .$('div.ni-li-dd')

  t.test('send', async function (t) {
    async function goToSendPage () {
      await navigate(client, 'Balances')
      await $('.ni-li-dt=FERMION').$('..').$('..').click()
    }

    await navigate(client, 'Balances')

    let sendBtn = () => $('.ni-form-footer button')
    let addressInput = () => $('#send-address')
    let amountInput = () => $('#send-amount')
    let denomBtn = (denom) => $(`option=${denom.toUpperCase()}`)

    t.test('fermion balance before sending', async function (t) {
      let fermionEl = balanceEl('fermion')
      let balance = await fermionEl.getText()
      t.equal(balance, '9007199254740992', 'fermion balance is correct') 
      t.end()
    })

    t.test('hit send with empty form', async function (t) {
      await goToSendPage()
      await sendBtn().click()
      t.equal(await sendBtn().getText(), 'Send Tokens', 'not sending')
      t.end()
    })

    t.test('address w/ less than 40 chars', async function (t) {
      await goToSendPage()
      await addressInput().setValue('012345')
      await $('div=Address must be exactly 40 characters').waitForExist()
      t.pass('got correct error message')
      await sendBtn().click()
      t.equal(await sendBtn().getText(), 'Send Tokens', 'not sending')
      t.end()
    })

    t.test('address w/ 40 chars', async function (t) {
      await goToSendPage()
      await addressInput().setValue('0'.repeat(40))
      t.notOk(await client.isExisting('div=Address must be exactly 40 characters'), 'no error message')
      await sendBtn().click()
      t.equal(await sendBtn().getText(), 'Send Tokens', 'not sending')
      t.end()
    })

    t.test('amount set', async function (t) {
      await goToSendPage()
      await amountInput().setValue('100')
      await sendBtn().click()
      t.equal(await sendBtn().getText(), 'Send Tokens', 'not sending')

      t.end()
    })

    t.test('send', async function (t) {
      await goToSendPage()
      await amountInput().setValue('100')
      await addressInput().setValue('3F52AFC4FB737A0296EFE331885FCC476980B3BD')
      await sendBtn().click()
      await client.waitForExist('.ni-notification', 5000)
      let msg = await client.$('.ni-notification .body').getText()
      t.ok(msg.includes('Success'), 'Send successful')
      
      t.end()
    })

    t.test('own balance updated', async function (t) {
      await navigate(client, 'Balances')

      // TODO should not be necessary
      await sleep(1000)
      await client.$('.material-icons=refresh').click()

      let mycoinEl = () => balanceEl('fermion')
      await waitForText(mycoinEl, '9007199254740892')
      t.pass('balance is reduced by 100')
      t.end()
    })

    t.end()
  })

  t.test('receive', async function (t) {
    t.test('fermion balance after receiving', async function (t) {
      await logout(client)
      await login(client, 'testreceiver')
      await navigate(client, 'Balances')

      let fermionEl = () => balanceEl('fermion')
      await waitForText(fermionEl, '100', 5000)
      t.pass('received mycoin transaction')
      t.end()
    })

    t.end()
  })

  t.end()
})
