"use strict"

const fs = require(`fs-extra`)
const path = require(`path`)
const startLocalNode = require(`../../gaia`).startLocalNode
const getNodeId = require(`../../gaia`).getNodeId
const makeValidator = require(`../../gaia`).makeValidator

let {
  initNode,
  createKey,
  initGenesis,
  makeExec,
  nodeBinary
} = require(`../../gaia.js`)

const buildLocalNode = buildTestnetPath => async options => {
  try {
    const chainId = `local-testnet`
    const moniker = `local`
    const localTestnetPath = `${buildTestnetPath}/${chainId}`
    // remove existing config
    if (options.overwrite) {
      fs.removeSync(localTestnetPath)
    }

    const clientHome = `./${localTestnetPath}/main-node-cli/lcd`
    const nodeHome = `${localTestnetPath}/main-node-home`
    const defaultAccountInfo = {
      keyName: `local`,
      password: options.password,
      clientHomeDir: clientHome
    }
    await initNode(
      chainId,
      moniker,
      nodeHome,
      options.password,
      options.overwrite
    )
    const { address } = await createKey(defaultAccountInfo)
    await initGenesis(defaultAccountInfo, address, nodeHome)
    await makeExec(
      `sed -i.bak 's/seeds = ""/seeds = "localhost"/g' ${nodeHome}/config.toml`
    )
    saveVersion(nodeHome)
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

// save the version of the currently used gaia into the newly created network config folder
const saveVersion = nodeHome => {
  const versionPath = path.join(nodeHome, `config`)
  let versionFilePath = path.join(versionPath, `gaiaversion.txt`) // nodeHome/config is used to copy created config files from
  return makeExec(
    `mkdir -p ${versionPath} && ${nodeBinary} version > ${versionFilePath}`
  )
}

// nodes[0] is a placeholder just to be aligned with the enumeration used in gaia
// TODO: next PR refactor also gaia to simplify numeration
const startNodes = async (nodes, mainAccountSignInfo) => {
  for (let i = 1; i < nodes.length; i++) {
    // start secondary nodes and connect to node one
    // wait until all nodes are showing blocks, so we know they are running
    await startLocalNode(nodes[i].home, i, i > 1 ? nodes[1].id : ``)
    // make our secondary nodes also to validators
    i > 1 &&
      (await makeValidator(
        mainAccountSignInfo,
        nodes[i].home,
        nodes[i].cliHome,
        `local_${i}`
      ))
  }
}

const buildNodes = async (targetDir, chainId, numberNodes = 1) => {
  const cliHomePrefix = path.join(targetDir, `cli_home`)
  const nodeHomePrefix = path.join(targetDir, `node_home`)

  fs.removeSync(targetDir)

  // create address to delegate staking tokens to 2nd and 3rd validator
  let mainAccountSignInfo = undefined
  let genesis = undefined

  const nodes = [{ id: `dummy` }]
  for (let i = 1; i < numberNodes + 1; i++) {
    // setup additional nodes
    const home = `${nodeHomePrefix}_${i}`
    const cliHome = `${cliHomePrefix}_${i}`
    nodes.push({
      home,
      cliHome,
      id: await setupLocalNode(home, i, chainId, true, genesis)
    })
    if (i === 1) {
      await saveVersion(home)
      mainAccountSignInfo = {
        keyName: `testkey`,
        password: `1234567890`,
        clientHomeDir: cliHome
      }
      let { address } = await createKey(mainAccountSignInfo)
      genesis = await initGenesis(mainAccountSignInfo, address, home)
    }
  }

  return { nodes, mainAccountSignInfo, genesis, cliHomePrefix }
}

// init a node and define it as a validator
async function setupLocalNode(
  nodeHome,
  number = 1,
  chainId = `local-testnet`,
  isTest = false,
  mainGenesis = undefined
) {
  await initNode(chainId, `local_${number}`, nodeHome, `1234567890`, true)
  mainGenesis &&
    (await fs.writeJSON(
      path.join(nodeHome, `config`, `genesis.json`),
      mainGenesis
    ))
  isTest && (await reduceTimeouts(nodeHome))

  return await getNodeId(nodeHome)
}

// declare candidacy for node

function reduceTimeouts(nodeHome, strictAddressbook = false) {
  const configPath = path.join(nodeHome, `config`, `config.toml`)
  let configToml = fs.readFileSync(configPath, `utf8`)

  const timeouts = [
    `timeout_propose`,
    `timeout_propose_delta`,
    `timeout_prevote`,
    `timeout_prevote_delta`,
    `timeout_precommit`,
    `timeout_precommit_delta`,
    `timeout_commit`,
    `flush_throttle_timeout`
  ]
  const updatedConfigToml = configToml
    .split(`\n`)
    .map(line => {
      let [key, value] = line.split(` = `)

      if (key === `addr_book_strict`) {
        return `${key} = ${strictAddressbook ? `true` : `false`}`
      }

      if (!timeouts.includes(key)) {
        return line
      }

      // timeouts are in the format "100ms" or "5s"
      value = value.replace(/"/g, ``)
      if (value.trim().endsWith(`ms`)) {
        value = parseInt(value.trim().substr(0, value.length - 2))
      } else if (value.trim().endsWith(`s`)) {
        value = parseInt(value.trim().substr(0, value.length - 1)) * 1000
      }

      return `${key} = "${value / 10}ms"`
    })
    .join(`\n`)

  fs.writeFileSync(configPath, updatedConfigToml, `utf8`)
}

module.exports = {
  buildLocalNode,
  buildNodes,
  saveVersion,
  startNodes
}
