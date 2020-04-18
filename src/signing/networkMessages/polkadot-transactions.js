/*
 * Source: https://github.com/polkadot-js/tools/blob/master/packages/signer-cli/src/cmdSendOffline.ts
 */
import { WsProvider, ApiPromise } from "@polkadot/api"

// will only be inited once per session
let api
export async function getAPI() {
  if (!api) {
    api = new ApiPromise({
      provider: new WsProvider("wss://kusama-rpc.polkadot.io/")
    })
  }
  await api.isReady
  return api
}

/**
 * Send a JSONRPC request to the node at substrateNodeEndpoint.
 *
 * @param substrateNodeEndpoint - The REST endpoint to hit for information.
 * @param method - The JSONRPC request method.
 * @param params - The JSONRPC request params.
 */
// function rpcToNode(substrateNodeEndpoint, method, params = []) {
//   // this is the actual default endpoint
//   const provider = new WsProvider(substrateNodeEndpoint)
//   return provider.send(method, params)
// }

export async function multiMessage(transactions) {
  const api = await getAPI()
  return api.tx.utility.batch(transactions)
}

/**
 * Entry point of the script.
 */
export async function getSignMessage(senderAddress, transaction) {
  if (Array.isArray(transaction)) {
    if (transaction.length > 1) {
      transaction = await multiMessage(transaction)
    } else {
      transaction = transaction[0]
    }
  }

  const api = await getAPI()
  const nonce = (await api.derive.balances.account(senderAddress)).accountNonce
  let options
  let blockNumber

  // Get current block if we want to modify the number of blocks we have to sign
  const signedBlock = await api.rpc.chain.getBlock()
  options = {
    blockHash: signedBlock.block.header.hash,
    era: api.createType("ExtrinsicEra", {
      current: signedBlock.block.header.number,
      period: 50
    }),
    nonce
  }
  blockNumber = signedBlock.block.header.number

  const payload = api.createType("SignerPayload", {
    version: api.extrinsicVersion,
    runtimeVersion: api.runtimeVersion,
    genesisHash: api.genesisHash,
    ...options,
    address: senderAddress,
    method: transaction.method,
    blockNumber
  })

  return { payload, transaction }
}
