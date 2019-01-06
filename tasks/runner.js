"use strict"
const config = require(`../app/src/config`)
const spawn = require(`child_process`).spawn
const path = require(`path`)

let YELLOW = `\x1b[33m`
let END = `\x1b[0m`

let NPM_BIN = path.join(path.dirname(__dirname), `node_modules`, `.bin`)
let PATH = `${NPM_BIN}:${process.env.PATH}`

const format = (command, data, color) =>
  `${color}${command}${END}  ${data
    .toString()
    .trim()
    .replace(/\n/g, `\n${` `.repeat(command.length + 2)}`)}\n`

function run(command, color, name, env) {
  env = Object.assign({ PATH }, env)
  let child = spawn(command, { env, shell: true })
  child.stdout.on(`data`, data => {
    console.log(format(name, data, color))
  })
  child.stderr.on(`data`, data => {
    console.error(format(name, data, color))
  })
  child.on(`exit`, code => {
    console.log(`exited`, command, code)
  })
  return child
}

module.exports = function startRendererServer() {
  return new Promise(resolve => {
    console.log(`${YELLOW}Starting webpack-dev-server...\n${END}`)
    let child = run(
      `webpack-dev-server --hot --colors --config webpack.renderer.config.js --port ${
        config.wds_port
      } --content-base app/dist --https --mode=development`,
      YELLOW,
      `webpack`
    )
    let waitForCompile = data => {
      if (!data.toString().includes(`Compiled`)) return
      child.stdout.removeListener(`data`, waitForCompile)
      resolve(child)
    }
    child.stdout.on(`data`, waitForCompile)
  })
}
