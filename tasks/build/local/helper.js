"use strict"

const fs = require(`fs-extra`)
const { join } = require(`path`)
const {
  startLocalNode,
  getNodeId,
  makeValidator,
  initNode,
  createKey,
  initGenesis,
  makeExec,
  getKeys,
  nodeBinary
} = require(`../../gaia`)

const buildLocalNode = buildTestnetPath => async ({
  numberNodes,
  ...options
}) => {
  try {
    const { nodes, mainAccountSignInfo } = await buildNodes(
      buildTestnetPath,
      options,
      numberNodes,
      false
    )
    console.log(`\n    🎉  SUCCESS 🎉\n`)
    console.log(
      `To start Voyager with ${nodes.length - 1} local node${
        nodes.length > 2 ? `s` : ``
      } please run:
  yarn start local-testnet

Default account:
  username: '${mainAccountSignInfo.keyName}'
  password: '${mainAccountSignInfo.password}'
`
    )
  } catch (error) {
    console.log(`Encountered an Error:`)
    console.error(error.msg ? error : error.toString())
  }
}

// save the version of the currently used gaia into the newly created network config folder
const saveVersion = nodeHome => {
  const versionPath = join(nodeHome, `config`)
  let versionFilePath = join(versionPath, `gaiaversion.txt`) // nodeHome/config is used to copy created config files from
  return makeExec(
    `mkdir -p ${versionPath} && ${nodeBinary} version > ${versionFilePath}`
  )
}

// nodes[0] is a placeholder just to be aligned with the enumeration used in gaia
// TODO: next PR refactor also gaia to simplify numeration
const startNodes = async (nodes, mainAccountSignInfo, chainId) => {
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
        nodes[i].moniker,
        chainId
      ))
  }
}

const buildNodes = async (
  targetDir,
  options = {
    chainId: `default-testnet`,
    password: `1234567890`,
    overwrite: true,
    moniker: `local`,
    keyName: `main-account`
  },
  numberNodes = 1,
  isTest = false
) => {
  const cliHomePrefix = join(targetDir, `cli_home`)
  const nodeHomePrefix = join(targetDir, `node_home`)

  fs.removeSync(targetDir)
  // fs.removeSync(`${os.home}/.cosmos-voyager-dev/${network}`)

  // create address to delegate staking tokens to 2nd and 3rd validator
  let mainAccountSignInfo = undefined
  let genesis = undefined

  const nodes = [{ id: `dummy` }]
  for (let i = 1; i < numberNodes + 1; i++) {
    // setup additional nodes
    const home = `${nodeHomePrefix}_${i}`
    const cliHome = `${cliHomePrefix}_${i}`
    const moniker = `${options.moniker}_${i}`
    nodes.push({
      home,
      cliHome,
      moniker,
      id: await setupLocalNode(home, options, moniker, isTest, genesis)
    })
    if (i === 1) {
      await saveVersion(home)
      mainAccountSignInfo = {
        keyName: options.keyName,
        password: options.password,
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
  options,
  moniker,
  isTest = false,
  mainGenesis = undefined
) {
  await initNode(
    options.chainId,
    moniker,
    nodeHome,
    options.password,
    options.overwrite
  )
  mainGenesis &&
    (await fs.writeJSON(join(nodeHome, `config`, `genesis.json`), mainGenesis))
  await adjustConfig(nodeHome, isTest)

  return await getNodeId(nodeHome)
}

// declare candidacy for node

function adjustConfig(nodeHome, isTest = false, strictAddressbook = false) {
  const configPath = join(nodeHome, `config`, `config.toml`)
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

      if (!isTest) {
        // TODO: this was happening on ./builds/testnets/local-testnet/config.toml
        //  but then the network was launched through the config ~/.gaiad-testnet/config/config.toml
        //  and it had seeds=""
        //  What was the goal of this replacement? is mentioned also in the readme
        // if (key === `seeds`) return `${key} = "localhost"`
        if (key === `index_all_tags`) return `${key} = true`
        return line
      }

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

const setupAccounts = async (srcClientDir, dstClientDir, options) => {
  // use the master account that holds funds from node 1
  // to use it, we copy the key database from node one to our Voyager cli config folder
  fs.copySync(srcClientDir, dstClientDir)

  // this account is later used to send funds to, to test token sending
  await createKey({
    keyName: (options && options.keyName) || `testreceiver`,
    password: (options && options.password) || `1234567890`,
    clientHomeDir: dstClientDir
  })

  let accounts = await getKeys(dstClientDir)
  console.log(`setup test accounts`, accounts)

  return accounts
}

module.exports = {
  buildLocalNode,
  buildNodes,
  saveVersion,
  setupAccounts,
  startNodes
}
