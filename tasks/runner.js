'use strict'

const config = require('../config')
const exec = require('child_process').exec
const treeKill = require('tree-kill')
const path = require('path')
const event = require('event-to-promise')

let YELLOW = '\x1b[33m'
let BLUE = '\x1b[34m'
let END = '\x1b[0m'

let NPM_BIN = path.join(path.dirname(__dirname), 'node_modules', '.bin')
let PATH = `${NPM_BIN}:${process.env.PATH}`

function format (command, data, color) {
  return color + command + END +
    '  ' + // Two space offset
    data.toString().trim().replace(/\n/g, '\n' + ' '.repeat(command.length + 2)) +
    '\n'
}

function run (command, color, name, env) {
  env = Object.assign({ PATH }, env)
  let child = exec(command, { env })
  child.stdout.on('data', data => {
    console.log(format(name, data, color))
  })
  child.stderr.on('data', data => {
    console.error(format(name, data, color))
  })
  child.on('exit', code => {
    console.log('exited', command, code)
  })
  process.on('exit', () => child.kill('SIGKILL'))
  return child
}

async function startRendererServer () {
  console.log(`${YELLOW}Starting webpack-dev-server...\n${END}`)
  let child = run(`
    webpack-dev-server --hot --colors \
      --config webpack.renderer.config.js \
      --port ${config.port} \
      --content-base app/dist
    `, YELLOW, 'webpack')
  while (true) {
    let data = await event(child.stdout, 'data')
    if (data.toString().includes('Compiled successfully')) break
  }
}

module.exports = async function (networkPath) {
  await startRendererServer()

  console.log(`${BLUE}Starting electron...\n  (network path: ${networkPath})\n${END}`)
  let env = {
    NODE_ENV: 'development',
    COSMOS_NETWORK: networkPath
  }
  run('electron app/src/main/index.dev.js', BLUE, 'electron', env)
}
