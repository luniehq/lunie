const path = require(`path`)
const fs = require(`fs-extra`)
const { spawn, exec } = require(`child_process`)
let { sleep } = require(`../test/e2e/common.js`)

const osFolderName = (function() {
  switch (process.platform) {
    case `win32`:
      return `windows_amd64`
    case `darwin`:
      return `darwin_amd64`
    case `linux`:
      return `linux_amd64`
  }
})()
let cliBinary =
  process.env.BINARY_PATH ||
  path.join(__dirname, `../builds/Gaia/`, osFolderName, `gaiacli`)

let nodeBinary =
  process.env.NODE_BINARY_PATH ||
  path.join(__dirname, `../builds/Gaia/`, osFolderName, `gaiad`)
const defaultStartPort = 26656

module.exports.initNode = async function initNode(
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

module.exports.createKey = async function createKey(
  name,
  password,
  clientHomeDir
) {
  let command = `${cliBinary} keys add ${name} --home ${clientHomeDir} -o json`
  return makeExecWithInputs(command, [password, password])
}

module.exports.getKeys = async function getKeys(clientHomeDir) {
  let command = `${cliBinary} keys list --home ${clientHomeDir} -o json`
  let accounts = await makeExec(command)
  return JSON.parse(accounts)
}

// init a genesis file with an account that has funds
module.exports.initGenesis = async function initGenesis(
  password,
  address,
  homeDir,
  clientHomeDir,
  operatorKeyName
) {
  const genesisLocation = path.join(homeDir, `config/genesis.json`)
  let genesis = fs.readJSONSync(genesisLocation)
  console.log(
    `Adding tokens to genesis at ${genesisLocation} for address ${address}`
  )
  genesis.app_state.accounts = genesis.app_state.accounts || []
  genesis.app_state.accounts.push({
    address,
    coins: [
      {
        denom: `steak`,
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
    `${nodeBinary} gentx --name ${operatorKeyName} --home ${homeDir} --home-client ${clientHomeDir}`,
    [password]
  )

  await makeExec(`${nodeBinary} collect-gentxs --home ${homeDir}`)

  genesis = fs.readJSONSync(genesisLocation)
  console.log(`X`, genesis)
  return genesis
}

module.exports.getGenesis = function getGenesis(homeDir) {
  const genesisLocation = path.join(homeDir, `config/genesis.json`)
  let genesis = fs.readJSONSync(genesisLocation)
  return genesis
}

// make it so that one initialized node will become a validator
module.exports.makeValidator = async function makeValidator(
  nodeHome,
  cliHome,
  number,
  accountName // account name that has funds
) {
  let newNodeHome = nodeHome + `_` + number
  let newCliHome = cliHome + `_` + number

  let valPubKey = await module.exports.getValPubKey(newNodeHome)
  let { address: operatorAddress } = await module.exports.createKey(
    `local`,
    `1234567890`,
    newCliHome
  )
  await module.exports.sendTokens(
    cliHome + `_1`, // main validator home with the key with funds
    `10steak`,
    accountName,
    operatorAddress
  )
  while (true) {
    console.log(`Waiting for funds to delegate`)
    try {
      await sleep(1000) // TODO identify why this timeout is needed
      await module.exports.getBalance(newCliHome, operatorAddress)
    } catch (err) {
      console.error(err)
      continue
    }
    break
  }
  await module.exports.declareValidator(
    newCliHome,
    `local_${number}`,
    valPubKey,
    operatorAddress,
    `local` // key name that holds funds and is the same address as the operator address
  )
}

module.exports.getValPubKey = async function getValPubKey(node_home) {
  let command = `${nodeBinary} tendermint show-validator --home ${node_home}`
  const stdout = await makeExec(command)
  return stdout.trim()
}
module.exports.getNodeId = async function getNodeId(node_home) {
  let command = `${nodeBinary} tendermint show-node-id --home ${node_home}`
  const stdout = await makeExec(command)
  return stdout.trim()
}
module.exports.getBalance = async function getBalance(cliHome, address) {
  let command = `${cliBinary} query account ${address} --home ${cliHome} --output "json" --trust-node`
  const stdout = await makeExec(command)
  return JSON.parse(stdout.trim())
}

// sends a create-validator tx
module.exports.declareValidator = async function declareValidator(
  mainCliHome,
  moniker,
  valPubKey,
  operatorAddress,
  operatorAccountName // key name that holds funds and is the same address as the operator address
) {
  let command =
    `${cliBinary} tx create-validator` +
    ` --home ${mainCliHome}` +
    ` --from ${operatorAccountName}` +
    ` --amount=10steak` +
    ` --pubkey=${valPubKey}` +
    ` --address-delegator=${operatorAddress}` +
    ` --moniker=${moniker}` +
    ` --chain-id=test_chain` +
    ` --commission-max-change-rate=0` +
    ` --commission-max-rate=0` +
    ` --commission-rate=0` +
    ` --json`

  return makeExecWithInputs(command, [`1234567890`])
}

module.exports.sendTokens = async function sendTokens(
  mainCliHome,
  tokenString,
  fromAccountName,
  toAddress
) {
  let command =
    `${cliBinary} tx send` +
    ` --home ${mainCliHome}` +
    ` --from ${fromAccountName}` +
    ` --amount=${tokenString}` +
    ` --to=${toAddress}` +
    ` --chain-id=test_chain`
  console.log(command)
  const child = await spawn(command, { shell: true })
  child.stderr.pipe(process.stderr)
  child.stdin.write(`1234567890\n`) // unlock signing key
  return new Promise((resolve, reject) => {
    child.stdout.once(`data`, resolve)
    child.stderr.once(`data`, reject)
  })
}

// start a node and connect it to nodeOne
// nodeOne is used as a persistent peer for all the other nodes
// wait for blocks to show as a proof, the node is running correctly
module.exports.startLocalNode = function startLocalNode(
  nodeHome, //prefix
  number,
  nodeOneId = ``
) {
  return new Promise((resolve, reject) => {
    const thisNodeHome = `${nodeHome}_${number}`
    let command = `${nodeBinary} start --home ${thisNodeHome}`
    if (number > 1) {
      // setup different ports
      command += ` --p2p.laddr=tcp://0.0.0.0:${defaultStartPort -
        (number - 1) * 3} --address=tcp://0.0.0.0:${defaultStartPort -
        (number - 1) * 3 +
        1} --rpc.laddr=tcp://0.0.0.0:${defaultStartPort - (number - 1) * 3 + 2}`
      // set the first node as a persistent peer
      command += ` --p2p.persistent_peers="${nodeOneId}@localhost:${defaultStartPort}"`
    }
    console.log(command)
    const localnodeProcess = spawn(command, { shell: true })

    // log output for debugging
    const logPath = path.join(thisNodeHome, `process.log`)
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

      if (msg.includes(`Block{`)) {
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

function makeExec(command) {
  console.log(`$ ` + command)
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout) => {
      if (err) return reject(err)
      resolve(stdout)
    })
  })
}

function makeExecWithInputs(command, inputs = []) {
  console.log(`$ ` + command)

  let binary = command.split(` `)[0]
  let args = command.split(` `).slice(1)
  return new Promise((resolve, reject) => {
    const child = spawn(binary, args)
    child.stderr.pipe(process.stderr)
    child.stdout.pipe(process.stdout)
    inputs.forEach(input => {
      child.stdin.write(`${input}\n`)
    })

    let resolved = false
    child.stdout.once(`data`, data => {
      if (resolved) return
      resolved = true
      resolve(JSON.parse(data))
    })

    child.once(`exit`, code => {
      if (resolved) return
      resolved = true
      code === 0 ? resolve() : reject(`Process exited with code ${code}`)
    })
  })
}
