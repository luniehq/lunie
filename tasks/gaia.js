const path = require(`path`)
const fs = require(`fs-extra`)
const util = require(`util`)
const { spawn, exec } = require(`child_process`)
const { sleep } = require(`../test/e2e/common.js`)

const osFolderName = {
  win32: `windows_amd64`,
  darwin: `darwin_amd64`,
  linux: `linux_amd64`
}[process.platform]
const cliBinary =
  process.env.BINARY_PATH ||
  path.join(__dirname, `../builds/Gaia/`, osFolderName, `gaiacli`)

const nodeBinary =
  process.env.NODE_BINARY_PATH ||
  path.join(__dirname, `../builds/Gaia/`, osFolderName, `gaiad`)
const defaultStartPort = 26656
const getStartPort = nodeNumber => defaultStartPort - (nodeNumber - 1) * 3
const defaultStakePool = 2000 * 10e6
const defaultStakedPerValidator = 10 * 10e6

// initialise the node config folder and genesis
async function initNode(
  chainId,
  moniker,
  homeDir,
  password = `1234567890`,
  overwrite = false
) {
  let command = `${nodeBinary} init ${moniker} --home ${homeDir} --chain-id ${chainId}`
  if (overwrite) {
    command += ` -o`
  }
  await makeExecWithInputs(command, [password])
}

async function createKey({ keyName, password, clientHomeDir }) {
  const command = `${cliBinary} keys add ${keyName} --home ${clientHomeDir} -o json`
  return makeExecWithInputs(command, [password, password])
}

async function getKeys(clientHomeDir) {
  const command = `${cliBinary} keys list --home ${clientHomeDir} -o json`
  const accounts = await makeExec(command)
  return JSON.parse(accounts)
}

// init a genesis file with an account that has funds
// creates a key to access this address in the clientHomeDir
async function initGenesis(
  { keyName, password, clientHomeDir }, // operator sign info
  address, // this address will have funds after initialization
  nodeHomeDir
) {
  await makeExec(
    `${nodeBinary} add-genesis-account ${address} ${defaultStakePool}stake,1000photino  --home ${nodeHomeDir}`
  )

  await makeExecWithInputs(
    `${nodeBinary} gentx --name ${keyName} --home ${nodeHomeDir} --home-client ${clientHomeDir}`,
    [password],
    false
  )

  await makeExec(`${nodeBinary} collect-gentxs --home ${nodeHomeDir}`)

  const genesisLocation = path.join(nodeHomeDir, `config/genesis.json`)
  const genesis = require(genesisLocation)
  return genesis
}

function getGenesis(homeDir) {
  return require(path.join(homeDir, `config/genesis.json`))
}

// make it so that one initialized node will become a validator
// the operator of that validator needs to declare the validator
// therefor the operator needs funds to do initial staking
// therefor we need to send some tokens from another account to the operator account
async function makeValidator(
  mainSignInfo, // main account that holds funds
  nodeHome,
  cliHome,
  moniker,
  chainId,
  operatorSignInfo = {
    keyName: `${moniker}-operator`,
    password: `1234567890`,
    clientHomeDir: cliHome
  }
) {
  const valPubKey = await getValPubKey(nodeHome)
  const account = await createKey(operatorSignInfo)

  const address = account.address
  await sendTokens(
    mainSignInfo,
    `${defaultStakedPerValidator}stake`,
    address,
    chainId
  )
  console.log(`Waiting for funds to delegate`)
  const forever = true
  while (forever) {
    try {
      await sleep(1000)
      await getBalance(cliHome, address)
    } catch (error) {
      continue
    }
    break
  }
  await declareValidator(
    operatorSignInfo, // key name that holds funds and is the same address as the operator address
    moniker,
    valPubKey,
    address,
    chainId
  )
}

async function getValPubKey(node_home) {
  const command = `${nodeBinary} tendermint show-validator --home ${node_home}`
  return await makeExec(command)
}
async function getNodeId(node_home) {
  const command = `${nodeBinary} tendermint show-node-id --home ${node_home}`
  return await makeExec(command)
}
async function getBalance(cliHome, address) {
  const command = `${cliBinary} query account ${address} --home ${cliHome} --output "json" --trust-node`
  return JSON.parse(await makeExec(command))
}

// sends a create-validator tx
async function declareValidator(
  { keyName, password, clientHomeDir }, // operatorSignInfo
  moniker,
  valPubKey,
  operatorAddress,
  chainId
) {
  const command =
    `${cliBinary} tx staking create-validator` +
    ` --home ${clientHomeDir}` +
    ` --from ${keyName}` +
    ` --amount=${defaultStakedPerValidator}stake` +
    ` --pubkey=${valPubKey}` +
    ` --address-delegator=${operatorAddress}` +
    ` --moniker=${moniker}` +
    ` --chain-id=${chainId}` +
    ` --commission-max-change-rate=0` +
    ` --commission-max-rate=0` +
    ` --commission-rate=0` +
    ` --min-self-delegation=1` +
    ` --output=json`

  return makeExecWithInputs(command, [password])
}

async function sendTokens(
  { keyName, password, clientHomeDir }, // senderSignInfo
  tokenString, // like "10stake" <- amount followed by denomination
  toAddress,
  chainId
) {
  await sleep(500)
  const command =
    `${cliBinary} tx send` +
    ` ${toAddress}` +
    ` ${tokenString}` +
    ` --home ${clientHomeDir}` +
    ` --from ${keyName}` +
    ` --chain-id=${chainId}`
  return makeExecWithInputs(command, [`Y`, password], false)
}

// start a node and connect it to nodeOne
// nodeOne is used as a persistent peer for all the other nodes
// wait for blocks to show as a proof, the node is running correctly
function startLocalNode(
  nodeHome,
  number = 1, // number is used to prevent conflicting ports when running multiple nodes
  nodeOneId = ``
) {
  return new Promise((resolve, reject) => {
    let command = `${nodeBinary} start --home ${nodeHome}` // TODO add --minimum_fees 1stake here
    if (number > 1) {
      const port = getStartPort(number)
      // setup different ports
      command += ` --p2p.laddr=tcp://0.0.0.0:${port} --address=tcp://0.0.0.0:${port +
        1} --rpc.laddr=tcp://0.0.0.0:${port + 2}`
      // set the first node as a persistent peer
      command += ` --p2p.persistent_peers="${nodeOneId}@localhost:${defaultStartPort}"`
    }
    if (process.env.VERBOSE) {
      console.log(`$ ` + command)
    }
    const localnodeProcess = spawn(command, {
      shell: true
    })

    // log output for debugging
    const logPath = path.join(nodeHome, `process.log`)
    console.log(`Redirecting node ` + number + ` output to ` + logPath)
    fs.createFileSync(logPath)
    const logStream = fs.createWriteStream(logPath, {
      flags: `a`
    })
    localnodeProcess.stdout.pipe(logStream)

    localnodeProcess.stderr.pipe(process.stderr)

    // wait 20s for the first block or assume the node has failed
    const timeout = setTimeout(() => {
      reject(`Timed out waiting for block for node ${number}`)
    }, 20000)

    // wait for a message about a block being produced
    function listener(data) {
      const msg = data.toString()

      if (msg.includes(`Executed block`)) {
        localnodeProcess.stdout.removeListener(`data`, listener)
        console.log(`Node ` + number + ` is running`)
        clearTimeout(timeout)
        resolve()
      }
    }

    console.log(`Waiting for first block on node ` + number)
    localnodeProcess.stdout.on(`data`, listener)

    localnodeProcess.once(`exit`, reject)
  })
}

// execute command and return stdout
function makeExec(command) {
  if (process.env.VERBOSE) {
    console.log(`$ ` + command)
  }

  return util
    .promisify(exec)(command)
    .then(({ stdout }) => stdout.trim())
}

// execute command, write all inputs followed by enter to stdin and return stdout
function makeExecWithInputs(command, inputs = [], json = true) {
  if (process.env.VERBOSE) {
    console.log(`$ ` + command)
  }

  const binary = command.split(` `)[0]
  const args = command.split(` `).slice(1)
  return new Promise((resolve, reject) => {
    const child = spawn(binary, args)

    // needed so commands don't fail on Ubuntu
    child.stderr.on(`error`, console.error)
    child.stdout.on(`error`, console.error)
    child.stdin.on(`error`, console.error)

    if (process.env.VERBOSE) {
      child.stderr.pipe(process.stderr)
      child.stdout.pipe(process.stdout)
    }
    inputs.forEach(input => {
      child.stdin.write(`${input}\n`)
    })

    let resolved = false
    child.stderr.once(`data`, data => {
      if (resolved) return
      resolved = true
      resolve(json ? JSON.parse(data) : data)
    })

    child.once(`exit`, code => {
      if (process.env.VERBOSE) {
        console.log(`EXIT:`, code)
      }
      if (resolved) return
      resolved = true
      code === 0 ? resolve() : reject(`Process exited with code ${code}`)
    })
  })
}

/*

    mnemonic: `release endorse scale across absurd trouble climb unaware actor elite fantasy chair license word rare length business kiss smoke tackle report february bid ginger`,
    address: `cosmos1ek9cd8ewgxg9w5xllq9um0uf4aaxaruvcw4v9e`,
    */
function sendMoneyToFixedAccounts(mainAccountSignInfo, chainId) {
  sendTokens(mainAccountSignInfo, `${100 * 10e6}stake`, `cosmos1ek9cd8ewgxg9w5xllq9um0uf4aaxaruvcw4v9e`, chainId)
}

module.exports = {
  initNode,
  createKey,
  getKeys,
  initGenesis,
  getGenesis,
  startLocalNode,
  makeValidator,
  getNodeId,
  sendMoneyToFixedAccounts,

  cliBinary,
  nodeBinary,
  defaultStartPort,

  makeExec,
  makeExecWithInputs
}
