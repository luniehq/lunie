const { getMessage } = require('./messageConstructor')
const { networks } = require('../../networks')

global.fetch = require('node-fetch')

async function estimate(tx) {
  const context = {
    userAddress: tx.address,
    networkId: tx.networkId,
    url: networks[tx.networkId].api_url,
    chainId: networks[tx.networkId].chain_id
  }

  const message = getMessage(tx.messageType, tx.txProperties, context)

  try {
    const gasEstimate = (await message.simulate({ memo: tx.memo })) * 4 // we quadrupled the gas to be safe. rn there are several txs failing on cosmoshub-3
    return {
      gasEstimate,
      success: true
    }
  } catch (e) {
    return {
      error: e,
      success: false
    }
  }
}

async function broadcast(tx) {
  console.log(`Received broadcast: ${JSON.stringify(tx)}`)
  try {
    const hash = await broadcastTransaction(
      networks[tx.networkId].api_url,
      tx.signedMessage
    )
    return {
      hash: hash,
      success: true
    }
  } catch (e) {
    return {
      error: e,
      success: false
    }
  }
}

module.exports = {
  estimate,
  broadcast
}

async function broadcastTransaction(url, signedTx) {
  // broadcast transaction with signatures included
  // `block` means we wait for the tx to be included into a block before returning. this helps with figuring out "out of gas" issues which only appear when the block is created
  const body = createBroadcastBody(signedTx, `block`)
  console.log('broadcast to:', url)
  // eslint-disable-next-line no-undef
  const res = await fetch(`${url}/txs`, {
    method: `POST`,
    headers: {
      'Content-Type': 'application/json'
    },
    body
  })
    .then(res => res.json())
    .then(assertOk)

  return res.txhash
}

function createBroadcastBody(signedTx, returnType = `block`) {
  return JSON.stringify({
    tx: signedTx,
    mode: returnType
  })
}

function assertOk(res) {
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
