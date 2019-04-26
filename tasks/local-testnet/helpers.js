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
  sendTokens
} = require(`../gaia`)

const buildLocalTestnet = async (
  buildTestnetPath,
  numberNodes,
  options
) => {
  options = Object.assign({
    chainId: `default-testnet`,
    password: `1234567890`,
    overwrite: true,
    moniker: `local`,
    keyName: `account-with-funds`
  }, options)
  const { nodes, mainAccountSignInfo } = await buildNodes(
    buildTestnetPath,
    options,
    numberNodes,
    false
  )
  await nodesInitialStart(nodes, mainAccountSignInfo, options.chainId)

  const { mnemonic, address } = await sendMoneyToFixedAccounts(
    mainAccountSignInfo, options.chainId
  )

  console.log(`\n    🎉  SUCCESS 🎉\n`)
  console.log(
    `The local testnet is running with ${nodes.length - 1} local node${
      nodes.length > 2 ? `s` : ``
    }. On consecutive just restart it with:
  yarn start

Import this account which owns tokens:
  address: '${address}'
  mnemonic: '${mnemonic}'
`
  )
}

// nodes[0] is a placeholder just to be aligned with the enumeration used in gaia
// TODO: next PR refactor also gaia to simplify numeration
const nodesInitialStart = async (nodes, mainAccountSignInfo, chainId) => {
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
  options,
  numberNodes = 1,
  isTest = false
) => {
  const cliHomePrefix = join(targetDir, `cli_home`)
  const nodeHomePrefix = join(targetDir, `node_home`)

  fs.removeSync(targetDir)

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
      mainAccountSignInfo = {
        keyName: options.keyName,
        password: options.password,
        mnemonic: options.mnemonic,
        clientHomeDir: cliHome
      }
      const account = await createKey(mainAccountSignInfo)
      console.log(`Imported Account`)
      genesis = await initGenesis(mainAccountSignInfo, account.address, home)
    }
  }

  sendMoneyToFixedAccounts(mainAccountSignInfo, options.chainId)

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

function adjustConfig(nodeHome, isTest = false, strictAddressbook = false) {
  const configPath = join(nodeHome, `config`, `config.toml`)
  const configToml = fs.readFileSync(configPath, `utf8`)

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

      // needs to be turned off when running multiple nodes locally
      if (key === `addr_book_strict`) {
        return `${key} = ${strictAddressbook ? `true` : `false`}`
      }

      // disable profile server which causes port errors when running multiple nodes
      if (key === `prof_laddr`) {
        return `prof_laddr = ""`
      }

      // need to allow as all nodes are on localhost
      if (key === `allow_duplicate_ip`) {
        return `allow_duplicate_ip = true`
      }

      if (!isTest) {
        // TODO: this was happening on ./builds/testnets/local-testnet/config.toml
        //  but then the network was launched through the config ~/.gaiad-testnet/config/config.toml
        //  and it had seeds=""
        //  What was the goal of this replacement? is mentioned also in the readme
        // if (key === `seeds`) return `${key} = "localhost"`
        if (key === `index_all_tags`) return `${key} = true`
        return line
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

const defaultRichAccount = {
  mnemonic: `release endorse scale across absurd trouble climb unaware actor elite fantasy chair license word rare length business kiss smoke tackle report february bid ginger`,
  address: `cosmos1ek9cd8ewgxg9w5xllq9um0uf4aaxaruvcw4v9e`
}
async function sendMoneyToFixedAccounts(mainAccountSignInfo, chainId) {
  await sendTokens(mainAccountSignInfo, `${100 * 10e6}stake`, defaultRichAccount.address, chainId)

  return defaultRichAccount
}

module.exports = {
  buildLocalTestnet,
  defaultRichAccount
}
