"use strict"

const fs = require(`fs-extra`)
const { cli } = require(`@nodeguy/cli`)
const path = require(`path`)
const homeDir = require(`os`).homedir()
const appDir = path.resolve(__dirname + `/../../../`)

let {
  initNode,
  createKey,
  initGenesis,
  makeExec,
  nodeBinary
} = require(`../../gaia.js`)

const optionsSpecification = {
  overwrite: [`overwrite ~/.gaiad-testnet/`, false],
  password: [`custom password, default is 1234567890`, 1234567890]
}

export const localTestnetPath = `builds/testnets/local-testnet/`

export const buildLocalNode = async options => {
  try {
    // remove existing config
    if (options.overwrite) {
      if (fs.existsSync(`${appDir}/${localTestnetPath}`)) {
        await makeExec(`rm -r ${localTestnetPath}`)
      }
      if (fs.existsSync(`${homeDir}/.gaiad-testnet`)) {
        await makeExec(`rm -r ~/.gaiad-testnet`)
      }
      if (fs.existsSync(`${homeDir}/.cosmos-voyager-dev/local-testnet`)) {
        await makeExec(`rm -r ~/.cosmos-voyager-dev/local-testnet`)
      }
    }

    const chainId = `local-testnet`
    const moniker = `local`
    const clientHome = `./${localTestnetPath}lcd`
    const nodeHome = `${homeDir}/.gaiad-testnet`
    const defaultAccountInfo = {
      keyName: `local`,
      password: options.password,
      clientHomeDir: clientHome
    }
    await initNode(
      chainId,
      moniker,
      `${localTestnetPath}/.gaiad-testnet`,
      options.password,
      options.overwrite
    )
    const { address } = await createKey(defaultAccountInfo)
    await initGenesis(defaultAccountInfo, address, nodeHome)
    await moveFiles()
    console.log(`\n    🎉  SUCCESS 🎉\n`)
    console.log(
      `To start Voyager with a local node please run:
  yarn start local-testnet

Default account:
  username: '${defaultAccountInfo.keyName}'
  password: '${defaultAccountInfo.password}'
`
    )
  } catch (error) {
    console.log(`Encountered an Error:`)
    console.error(error.msg ? error : error.toString())
  }
}

cli(optionsSpecification, buildLocalNode)

async function moveFiles() {
  fs.ensureDirSync(`builds/testnets/local-testnet`)

  await makeExec(
    `cp ~/.gaiad-testnet/config/{genesis.json,config.toml} builds/testnets/local-testnet/`
  )

  await makeExec(
    `sed -i.bak 's/seeds = ""/seeds = "localhost"/g' ./builds/testnets/local-testnet/config.toml`
  )

  await makeExec(
    `sed -i.bak 's/index_all_tags = false/index_all_tags = true/g'  ${homeDir}/.gaiad-testnet/config/config.toml`
  )

  await makeExec(
    `${nodeBinary} version > ./builds/testnets/local-testnet/gaiaversion.txt`
  )
}
