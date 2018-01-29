const spawn = require('child_process').spawn
const {cleanExitChild} = require('./common.js')

function test (executablePath) {
  return new Promise(async (resolve, reject) => {
    let child
    try {
      child = spawn(executablePath, {
        env: {
          ELECTRON_ENABLE_LOGGING: 'true'
        }
      })

      child.stdout.pipe(process.stdout)

      child.stdout.on('data', async data => {
        let msg = new Buffer(data, 'utf-8').toString()
        if (msg.indexOf('[START SUCCESS]') !== -1) {
          clearTimeout(wait)
          await cleanExitChild(child)
          resolve()
        }
      })

      let wait = setTimeout(async () => {
        await cleanExitChild(child)
        reject()
      }, 5000)
    } catch (err) {
      await cleanExitChild(child)
      console.error('Unexpected error', err)
      reject(err)
    }
  })
}

async function main () {
  let executablePath = process.argv[2]

  if (!executablePath) {
    console.error('\nPlease define the executable you want to test like "yarn run test:exe ./Cosmos.exe"\n')
    process.exit(-1)
  }
  await test(executablePath)
  .then(() => console.log(executablePath, 'starts as expected'))
  .catch(() => console.error(executablePath, 'did not start as expected'))
}

main()

