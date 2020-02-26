// const { getMessage } = require('./messageConstructor')
const { networkMap } = require('../../networks')
const Sentry = require('@sentry/node')
const { publishUserTransactionAdded } = require('../../subscriptions')
const reducers = require('../../reducers/cosmosV0-reducers') // TODO the whole transaction service only works for cosmos rn

global.fetch = require('node-fetch')

async function estimate() {
  // const context = {
  //   userAddress: tx.address,
  //   networkId: tx.networkId,
  //   url: networkMap[tx.networkId].api_url,
  //   chainId: networkMap[tx.networkId].chain_id
  // }

  // const message = getMessage(tx.messageType, tx.txProperties, context)

  try {
    // const gasEstimate = await message.simulate({ memo: tx.memo }) + 100000
    // HACK: fixed to this value for now. too high gas can lead to transactions never being included. too low gas can lead to rejected txs and cost the user money.
    const gasEstimate = 550000

    return {
      gasEstimate,
      success: true
    }
  } catch (e) {
    return {
      error: e.message,
      success: false
    }
  }
}

async function broadcast(tx) {
  console.log(`Received broadcast: ${JSON.stringify(tx)}`)
  try {
    const hash = await broadcastTransaction(
      tx.networkId,
      tx.senderAddress,
      networkMap[tx.networkId].api_url,
      tx.signedMessage
    )
    return {
      hash: hash,
      success: true
    }
  } catch (e) {
    Sentry.withScope(function(scope) {
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
  estimate,
  broadcast
}

// TODO implment broadcasting across network types
async function broadcastTransaction(networkId, senderAddress, url, signedTx) {
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
    .then(async res => {
      if (res.status !== 200) {
        throw new Error(await res.text())
      }
      return res
    })
    .then(res => res.json())
    .then(assertOk)

  // check if tx is successful when executed vs when broadcasted
  pollTransactionSuccess(
    networkId,
    senderAddress,
    url,
    res.txhash,
    signedTx,
    res
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
    const message = JSON.parse(res.raw_log).message
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
  iteration = 0
) {
  let res
  console.error('Polling tx ', hash)
  try {
    try {
      res = await global.fetch(`${url}/txs/${hash}`).then(async res => {
        if (res.status !== 200) {
          throw new Error(await res.text())
        } else {
          return res.json()
        }
      })
    } catch (error) {
      // retry for 60s
      if (iteration < MAX_POLL_ITERATIONS) {
        await new Promise(resolve => setTimeout(resolve, 2000))
        pollTransactionSuccess(
          networkId,
          senderAddress,
          url,
          hash,
          broadcastedTransaction,
          broadcastResponse,
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
    const transaction = reducers.transactionReducer(res, reducers)
    publishUserTransactionAdded(networkId, senderAddress, transaction)
  } catch (error) {
    console.error('TX failed:', hash, error)
    let transaction
    if (res.tx) {
      transaction = reducers.transactionReducer(res, reducers)
    } else {
      // on timeout we don't get a transaction back
      transaction = {
        type: '',
        hash,
        height: -1,
        group: '',
        timestamp: '',
        signature: '',
        value: '',
        success: false,
        log: error.message
      }
    }
    publishUserTransactionAdded(networkId, senderAddress, transaction)
    Sentry.withScope(scope => {
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
