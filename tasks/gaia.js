const path = require(`path`)
const fs = require(`fs-extra`)
const util = require(`util`)
const { spawn, exec } = require(`child_process`)
let { sleep } = require(`../test/e2e/common.js`)

const osFolderName = {
  win32: `windows_amd64`,
  darwin: `darwin_amd64`,
  linux: `linux_amd64`
}[process.platform]
let cliBinary =
  process.env.BINARY_PATH ||
  path.join(__dirname, `../builds/Gaia/`, osFolderName, `gaiacli`)

let nodeBinary =
  process.env.NODE_BINARY_PATH ||
  path.join(__dirname, `../builds/Gaia/`, osFolderName, `gaiad`)
const defaultStartPort = 26656
const getStartPort = nodeNumber => defaultStartPort - (nodeNumber - 1) * 3

// initialise the node config folder and genesis
async function initNode(
  chainId,
  moniker,
  homeDir,
  password = `1234567890`,
  overwrite = false
) {
  let command = `${nodeBinary} init --home ${homeDir} --moniker ${moniker} --chain-id ${chainId}`
  if (overwrite) {
    command += ` -o`
  }
  await makeExecWithInputs(command, [password])
}

async function createKey({ keyName, password, clientHomeDir }) {
  let command = `${cliBinary} keys add ${keyName} --home ${clientHomeDir} -o json`
  return makeExecWithInputs(command, [password, password])
}

async function getKeys(clientHomeDir) {
  let command = `${cliBinary} keys list --home ${clientHomeDir} -o json`
  let accounts = await makeExec(command)
  return JSON.parse(accounts)
}

// init a genesis file with an account that has funds
// creates a key to access this address in the clientHomeDir
async function initGenesis(
  { keyName, password, clientHomeDir }, // operator sign info
  address, // this address will have funds after initialization
  nodeHomeDir
) {
  const genesisLocation = path.join(nodeHomeDir, `config/genesis.json`)
  let genesis = require(genesisLocation)
  console.log(
    `Adding tokens to genesis at ${genesisLocation} for address ${address}`
  )
  genesis.app_state.accounts = genesis.app_state.accounts || []
  genesis.app_state.accounts.push({
    address,
    coins: [
      {
        denom: `STAKE`,
        amount: `150`
      },
      {
        denom: `localcoin`,
        amount: `1000`
      }
    ]
  })
  fs.writeJSONSync(genesisLocation, genesis)

  await makeExecWithInputs(
    `${nodeBinary} gentx --name ${keyName} --home ${nodeHomeDir} --home-client ${clientHomeDir}`,
    [password],
    false
  )

  await makeExec(`${nodeBinary} collect-gentxs --home ${nodeHomeDir}`)

  genesis = fs.readJSONSync(genesisLocation)
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
    keyName: `local`,
    password: `1234567890`,
    clientHomeDir: cliHome
  }
) {
  let valPubKey = await getValPubKey(nodeHome)
  let { address } = await createKey(operatorSignInfo)
  await sendTokens(mainSignInfo, `10STAKE`, address, chainId)
  while (true) {
    console.log(`Waiting for funds to delegate`)
    try {
      await sleep(1000)
      await getBalance(cliHome, address)
    } catch (error) {
      console.error(error) // kept in here to see if something unexpected fails
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
  let command = `${nodeBinary} tendermint show-validator --home ${node_home}`
  return await makeExec(command)
}
async function getNodeId(node_home) {
  let command = `${nodeBinary} tendermint show-node-id --home ${node_home}`
  return await makeExec(command)
}
async function getBalance(cliHome, address) {
  let command = `${cliBinary} query account ${address} --home ${cliHome} --output "json" --trust-node`
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
  let command =
    `${cliBinary} tx stake create-validator` +
    ` --home ${clientHomeDir}` +
    ` --from ${keyName}` +
    ` --amount=10STAKE` +
    ` --pubkey=${valPubKey}` +
    ` --address-delegator=${operatorAddress}` +
    ` --moniker=${moniker}` +
    ` --chain-id=${chainId}` +
    ` --commission-max-change-rate=0` +
    ` --commission-max-rate=0` +
    ` --commission-rate=0` +
    ` --json`

  return makeExecWithInputs(command, [password])
}

async function sendTokens(
  { keyName, password, clientHomeDir }, // senderSignInfo
  tokenString, // like "10stake" <- amount followed by denomination
  toAddress,
  chainId
) {
  let command =
    `${cliBinary} tx send` +
    ` --home ${clientHomeDir}` +
    ` --from ${keyName}` +
    ` --amount=${tokenString}` +
    ` --to=${toAddress}` +
    ` --chain-id=${chainId}`
  return makeExecWithInputs(command, [password], false)
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
    let command = `${nodeBinary} start --home ${nodeHome}` // TODO add --minimum_fees 1STAKE here
    if (number > 1) {
      const port = getStartPort(number)
      // setup different ports
      command += ` --p2p.laddr=tcp://0.0.0.0:${port} --address=tcp://0.0.0.0:${port +
        1} --rpc.laddr=tcp://0.0.0.0:${port + 2}`
      // set the first node as a persistent peer
      command += ` --p2p.persistent_peers="${nodeOneId}@localhost:${defaultStartPort}"`
    }
    console.log(command)
    const localnodeProcess = spawn(command, { shell: true })

    // log output for debugging
    const logPath = path.join(nodeHome, `process.log`)
    console.log(`Redirecting node ` + number + ` output to ` + logPath)
    fs.createFileSync(logPath)
    let logStream = fs.createWriteStream(logPath, { flags: `a` })
    localnodeProcess.stdout.pipe(logStream)

    localnodeProcess.stderr.pipe(process.stderr)

    // wait 20s for the first block or assume the node has failed
    const timeout = setTimeout(() => {
      reject(`Timed out waiting for block for node ${number}`)
    }, 20000)

    // wait for a message about a block being produced
    function listener(data) {
      let msg = data.toString()

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
  console.log(`$ ` + command)
  return util
    .promisify(exec)(command)
    .then(({ stdout }) => stdout.trim())
}

// execute command, write all inputs followed by enter to stdin and return stdout
function makeExecWithInputs(command, inputs = [], json = true) {
  console.log(`$ ` + command)

  let binary = command.split(` `)[0]
  let args = command.split(` `).slice(1)
  return new Promise((resolve, reject) => {
    const child = spawn(binary, args)

    // needed so commands don't fail on Ubuntu
    child.stderr.on(`error`, console.error)
    child.stdout.on(`error`, console.error)
    child.stdin.on(`error`, console.error)

    child.stderr.pipe(process.stderr)
    child.stdout.pipe(process.stdout)
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
      if (resolved) return
      resolved = true
      code === 0 ? resolve() : reject(`Process exited with code ${code}`)
    })
  })
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

  cliBinary,
  nodeBinary,
  defaultStartPort,

  makeExec,
  makeExecWithInputs
}
