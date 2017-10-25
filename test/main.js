let test = require('tape-promise/tape')
let proxyquire = require('proxyquire')

test('main runs', async function (t) {
  await proxyquire('../app/dist/main', {
    electron: {
      app: {
        on: () => {},
        quit: () => {}
      }
    }
  })
  t.ok()
})
