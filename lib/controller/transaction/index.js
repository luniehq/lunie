// const { getMessage } = require('./messageConstructor')
const { networkMap } = require('../../networks')
const Sentry = require('@sentry/node')
const { publishUserTransactionAddedV2 } = require('../../subscriptions')
const { storeTransactions } = require('../../statistics')
const { ApiPromise, WsProvider } = require('@polkadot/api')
const networks = require('../../../data/networks')

global.fetch = require('node-fetch')

let api
async function initPolkadotAPI() {
  // ignore polkadot in tests for now
  if (process.env.TEST || !networkMap['kusama']) return

  api = new ApiPromise({
    provider: new WsProvider(networkMap['kusama'].rpc_url)
  })
  await api.isReady
}
initPolkadotAPI()

async function getPolkadotAPI() {
  await api.isReady
  return api
}

async function broadcastWithCosmos(tx, fingerprint, development) {
  const hash = await broadcastCosmosTransaction(
    tx.networkId,
    tx.senderAddress,
    networkMap[tx.networkId].api_url,
    tx.signedMessage,
    fingerprint,
    development
  )
  return {
    hash: hash,
    success: true
  }
}

async function broadcastWithPolkadot(
  tx
  // fingerprint
) {
  const api = await getPolkadotAPI()

  const result = await api.rpc.author.submitExtrinsic(tx.signedMessage)

  const hash = result.toJSON()

  return {
    hash,
    success: true
  }
}

async function broadcast(tx, fingerprint, development) {
  console.log(`Received broadcast: ${JSON.stringify(tx)}`)
  try {
    switch (networkMap[tx.networkId].network_type) {
      case 'cosmos':
        return await broadcastWithCosmos(tx, fingerprint, development)
      case 'polkadot':
        return await broadcastWithPolkadot(tx, fingerprint, development)
    }
  } catch (e) {
    Sentry.withScope(function (scope) {
      scope.setExtra('api_url', networkMap[tx.networkId].api_url)
      scope.setExtra('transaction', tx.signedMessage)
      Sentry.captureException(e)
    })
    return {
      error: e.message,
      success: false
    }
  }
}

module.exports = {
  broadcast
}

// TODO implement broadcasting across network types
async function broadcastCosmosTransaction(
  networkId,
  senderAddress,
  url,
  signedTx,
  fingerprint,
  development
) {
  // broadcast transaction with signatures included
  // `block` means we wait for the tx to be included into a block before returning. this helps with figuring out "out of gas" issues which only appear when the block is created
  const body = createBroadcastBody(signedTx, `sync`)

  url = url.trim('/') // there is an error broadcasting if the URL ends with //txs
  const broadcastUrl = `${url}/txs`

  console.log('broadcast to:', broadcastUrl, 'with body', body)
  // eslint-disable-next-line no-undef
  const res = await fetch(broadcastUrl, {
    method: `POST`,
    headers: {
      'Content-Type': 'application/json'
    },
    body
  })
    // somehow the broadcasting endpoint fails sometimes
    .then(async (res) => {
      if (res.status !== 200) {
        throw new Error(await res.text())
      }
      return res
    })
    .then((res) => res.json())
    .then(assertOk)

  // check if tx is successful when executed vs when broadcasted
  pollTransactionSuccess(
    networkId,
    senderAddress,
    url,
    res.txhash,
    signedTx,
    res,
    fingerprint,
    development
  )

  return res.txhash
}

function createBroadcastBody(signedTx, returnType = `sync`) {
  return JSON.stringify({
    tx: signedTx,
    mode: returnType
  })
}

function assertOk(res) {
  if (!res) throw new Error(`Error sending transaction`)
  if (Array.isArray(res)) {
    if (res.length === 0) throw new Error(`Error sending transaction`)

    res.forEach(assertOk)
  }

  if (res.error) {
    throw new Error(res.error)
  }

  // Sometimes we get back failed transactions, which shows only by them having a `code` property
  if (res.code) {
    const message = res.raw_log.message
      ? JSON.parse(res.raw_log).message
      : res.raw_log
    throw new Error(message)
  }

  if (!res.txhash) {
    const message = res.message
    throw new Error(message)
  }

  return res
}

// TODO replace with a tx tracking system + respond to transactions included in a block and compare them against the ones done in Lunie
// as we broadcast transactions asynchronously we need to react to them failing once executed in a block
// the simplest way to do this in Cosmos is to poll for the tx until it either succeeds or fails
const MAX_POLL_ITERATIONS = 150 // 5mins
async function pollTransactionSuccess(
  networkId,
  senderAddress,
  url,
  hash,
  broadcastedTransaction,
  broadcastResponse,
  fingerprint,
  development,
  iteration = 0
) {
  const network = networks.find(({ id }) => id === networkId)
  const NetworkApiClass = require('../../' + network.source_class_name)
  const store = {}
  const NetworkApi = new NetworkApiClass(network, store)
  let res
  console.error('Polling tx ', hash)
  try {
    try {
      res = await global.fetch(`${url}/txs/${hash}`).then(async (res) => {
        if (res.status !== 200) {
          throw new Error(await res.text())
        } else {
          return res.json()
        }
      })
    } catch (error) {
      // retry for 60s
      if (iteration < MAX_POLL_ITERATIONS) {
        await new Promise((resolve) => setTimeout(resolve, 2000))
        pollTransactionSuccess(
          networkId,
          senderAddress,
          url,
          hash,
          broadcastedTransaction,
          broadcastResponse,
          fingerprint,
          development,
          iteration + 1
        )
        return
      }

      res = {
        hash,
        success: false,
        height: -1
      }
      throw new Error(
        'Timed out waiting for the transaction to be included in a block'
      )
    }

    assertOk(res)
    // publishUserTransactionAdded is also done in the block subscription
    // but also here as a fallback
    // TODO the client might now update twice as it receives the success twice, could be fine though
    const transactions = NetworkApi.reducers.transactionReducerV2(
      networkId,
      res,
      NetworkApi.reducers
    )
    // store in db (will not happen if transaction is not successful)
    if (!development) {
      storeTransactions(transactions, networkId, senderAddress, fingerprint)
    }
    // notify users
    transactions.forEach((transaction) =>
      publishUserTransactionAddedV2(networkId, senderAddress, transaction)
    )
  } catch (error) {
    console.error('TX failed:', hash, error)

    let transactions
    if (res.tx) {
      transactions = NetworkApi.reducers.transactionReducerV2(
        res,
        NetworkApi.reducers
      )
    } else {
      // on timeout we don't get a transactionV2 back
      transactions = [
        {
          type: '',
          hash,
          key: '',
          height: -1,
          details: {},
          timestamp: '',
          memo: '',
          success: false,
          log: error.message
        }
      ]
    }

    transactions.forEach((transaction) =>
      publishUserTransactionAddedV2(networkId, senderAddress, transaction)
    )

    Sentry.withScope((scope) => {
      scope.setExtra('api_url', url)
      scope.setExtra('hash', hash)
      scope.setExtra('address', senderAddress)
      scope.setExtra('tx_query', res)
      scope.setExtra('transaction', broadcastedTransaction)
      scope.setExtra('broadcast_response', broadcastResponse)
      Sentry.captureException(error)
    })
  }
}
