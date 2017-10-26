let { join } = require('path')
let test = require('tape-promise/tape')
let proxyquire = require('proxyquire')
let { newTempDir } = require('./common.js')

let home = newTempDir()
console.error(`ui home: ${home}`)

Object.assign(process.env, {
  COSMOS_TEST: 'true',
  COSMOS_HOME: home,
  COSMOS_NETWORK: join(__dirname, 'localtestnet')
})

test('main', async function (t) {
  // exit if tests produce logs after termination
  process.stdout.on('error', function( err ) {
    if (err.code == "EPIPE" || err.code == "ECONNRESET") {
        process.exit(0);
    }
  });

  await proxyquire('../app/dist/main', {
    electron: {
      app: {
        on: () => {},
        quit: () => {}
      }
    }
  }).default
  .catch(t.fail)
  t.ok(true, 'main function is running')
  t.end()
  process.exit(0)
})
