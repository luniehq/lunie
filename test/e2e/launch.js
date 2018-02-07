'use strict'

let { Application } = require('spectron')
let test = require('tape-promise/tape')
let electron = require('electron')
let { join } = require('path')
let { spawn } = require('child_process')
let { newTempDir } = require('./common.js')

// re-use app instance
let app, home, cliHome, started
let binary = process.env.BINARY_PATH 

module.exports = function launch (t) {
  if (!started) {
    started = new Promise(async (resolve, reject) => {
      console.log('using binary', binary) 
    
      // TODO cleanup 
      home = newTempDir() 
      cliHome = join(newTempDir(), 'baseserver') 
      console.error(`ui home: ${home}`) 
      console.error(`node home: ${cliHome}`) 
    
      await startLocalNode()
    
      app = new Application({
        path: electron,
        args: [
          join(__dirname, '../../app/dist/main.js'),
          '--disable-gpu',
          '--no-sandbox'
        ],
        startTimeout: 10000,
        waitTimeout: 10000,
        env: {
            // COSMOS_UI_ONLY: 'true', 
            // COSMOS_TEST: 'true', 
            COSMOS_NODE: 'localhost', 
            NODE_ENV: 'production', 
            PREVIEW: 'true', 
            COSMOS_DEVTOOLS: 0, // open devtools will cause issues with spectron, you can open them later manually 
            COSMOS_HOME: home, 
            COSMOS_NETWORK: 'test/e2e/localtestnet' 
        }
      })

      await startApp(app)
      t.ok(app.isRunning(), 'app is running')

      console.log('stopping app to test consecutive run')
      await app.stop()

      await new Promise((resolve, reject) => {
        let child = spawn(binary, [
          'client', 'keys', 'recover', 'testkey',
          '--home', join(home, 'baseserver')
        ])
        child.stdin.write('1234567890\n')
        child.stdin.write('chair govern physical divorce tape movie slam field gloom process pen universe allow pyramid private ability\n')
        child.stderr.pipe(process.stdout)
        child.once('exit', (code) => {
          if (code === 0) resolve()
          reject()
        })
      })
      console.log('restored test account')

      await startApp(app)
      t.ok(app.isRunning(), 'app is running')

      await login(app)

      resolve({app, home})
    })
  }
  
  return started
}

test.onFinish(() => app ? app.stop() : null)

function printAppLog (app) {
  app.client.getMainProcessLogs().then(function (logs) {
    logs.forEach(function (log) {
      console.log(log)
    })
  })
  app.client.getRenderProcessLogs().then(function (logs) {
    logs.forEach(function (log) {
      console.log(log.message)
      console.log(log.source)
      console.log(log.level)
    })
  })
}

async function login (app) {
  await app.client.$('#sign-in-password').setValue('1234567890')
  await app.client.$('.ni-session-footer button').click()
  await app.client.waitForExist('#app-content', 5000)
}

async function startApp (app) {
  await app.start()

  await app.client.waitForExist('.ni-session', 5000)
  .catch(e => {
    printAppLog(app)
    throw e
  })
} 

async function startLocalNode () {
  await new Promise((resolve, reject) => {
    let child = spawn(binary, [ 
      'node', 'init', 
      'D0718DDFF62D301626B428A182F830CBB0AD21FC', 
      '--home', cliHome, 
      '--chain-id'  , 'localtestnet' 
    ]) 
    child.once('exit', (code) => { 
      if (code === 0) resolve()
      reject()
    }) 
  })
  console.log('inited local node')

  await new Promise((resolve, reject) => {
    // TODO cleanup
    let localnodeProcess = spawn(binary, [ 
      'node', 'start', 
      '--home', cliHome 
    ])
    localnodeProcess.stderr.pipe(process.stderr) 
    localnodeProcess.stdout.once('data', data => { 
      let msg = data.toString()
      if (!msg.includes('Failed') && !msg.includes('Error')) {
        resolve()
      }
      reject()
    }) 
    localnodeProcess.once('exit', (code) => { 
      reject()
    })
  })
  console.log('started local node')
}