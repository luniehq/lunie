"use strict"

const os = require(`os`)
const fs = require(`fs-extra`)
const { cli } = require(`@nodeguy/cli`)
const path = require(`path`)
const homeDir = require(`os`).homedir()
const appDir = path.resolve(__dirname + `/../../../`)

let { exec } = require(`child_process`)

let { initNode, createKey, initGenesis } = require(`../../gaia.js`)

const optionsSpecification = {
  overwrite: [`overwrite ~/.gaiad-testnet/`, false],
  password: [`custom password, default is 1234567890`, 1234567890]
}

cli(optionsSpecification, async options => {
  const platform = os.platform()
  const environment =
    platform === `darwin`
      ? `darwin_amd64`
      : platform === `win32`
        ? `windows_amd64`
        : `linux_amd64`
  try {
    // remove existing config
    if (options.overwrite) {
      if (fs.existsSync(appDir + `/builds/testnets/local-testnet`)) {
        let out = await makeExec(`rm -r builds/testnets/local-testnet`)
        out && console.log(out)
      }
      if (fs.existsSync(homeDir + `/.gaiad-testnet`)) {
        let out = await makeExec(`rm -r ~/.gaiad-testnet`)
        out && console.log(out)
      }
      if (fs.existsSync(homeDir + `/.cosmos-voyager-dev/local-testnet`)) {
        let out = await makeExec(`rm -r ~/.cosmos-voyager-dev/local-testnet`)
        out && console.log(out)
      }
    }

    const chainId = `local-testnet`
    const moniker = `local`
    const operatorKeyName = `local`
    const clientHome = `./builds/testnets/local-testnet/lcd`
    const nodeHome = `${homeDir}/.gaiad-testnet`
    await initNode(
      chainId,
      moniker,
      `${homeDir}/.gaiad-testnet`,
      options.password,
      options.overwrite
    )
    const { address } = await createKey(`local`, options.password, clientHome)
    await initGenesis(
      options.password,
      address,
      nodeHome,
      clientHome,
      operatorKeyName
    )
    await moveFiles(options, environment)
    console.log(`\n    🎉  SUCCESS 🎉\n`)
    console.log(
      `To start Voyager with a local node please run:
  yarn start local-testnet

Default account:
  username: 'local'
  password: '1234567890'
`
    )
  } catch (error) {
    console.log(`Encountered an Error:`)
    console.error(error.msg ? error : error.toString())
  }
})

function makeExec(command) {
  console.log(`$ ` + command)
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (err) return reject(err)
      if (stderr) return reject(stderr)
      resolve(stdout)
    })
  })
}
async function moveFiles(options, environment) {
  let out
  fs.ensureDirSync(`builds/testnets/local-testnet`)

  out = await makeExec(
    `cp ~/.gaiad-testnet/config/{genesis.json,config.toml} builds/testnets/local-testnet/`
  )
  out && console.log(out)

  out = await makeExec(
    `sed -i.bak 's/seeds = ""/seeds = "localhost"/g' ./builds/testnets/local-testnet/config.toml`
  )
  out && console.log(out)

  out = await makeExec(
    `sed -i.bak 's/index_all_tags = false/index_all_tags = true/g'  ${homeDir}/.gaiad-testnet/config/config.toml`
  )
  out && console.log(out)

  out = await makeExec(
    `./builds/Gaia/${environment}/gaiad version > ./builds/testnets/local-testnet/gaiaversion.txt`
  )
  out && console.log(out)
}
