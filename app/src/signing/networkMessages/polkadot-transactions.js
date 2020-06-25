/*
 * Source: https://github.com/polkadot-js/tools/blob/master/packages/signer-cli/src/cmdSendOffline.ts
 */
import { WsProvider, ApiPromise } from "@polkadot/api"
import { u8aToHex, u8aConcat } from "@polkadot/util"
import { createApolloProvider } from "src/gql/apollo.js"
import { NetworksAll } from "src/gql"
import config from "src/../config"

export async function getPolkadotNetworks() {
  const apolloProvider = await createApolloProvider()
  const apollo = apolloProvider.clients.defaultClient
  const { data } = await apollo.query({
    query: NetworksAll,
    variables: { experimental: config.experimentalMode },
    fetchPolicy: "network-only",
  })
  return data.networks.filter((network) => network.network_type === `polkadot`)
}

// will only be inited once per session
let apis = {}
let polkadotNetworks
export async function getAPI(networkId) {
  if (!apis[networkId]) {
    if (!polkadotNetworks) {
      polkadotNetworks = await getPolkadotNetworks()
    }
    const polkadotNetwork = polkadotNetworks.find(
      (network) => network.id === networkId
    )
    const endpoint = polkadotNetwork.rpc_url
    apis[networkId] = new ApiPromise({
      provider: new WsProvider(endpoint),
    })
  }
  await apis[networkId].isReady
  return apis[networkId]
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

export async function multiMessage(transactions, networkId) {
  const api = await getAPI(networkId)
  return api.tx.utility.batch(transactions)
}

/**
 * Entry point of the script.
 */
export async function getSignMessage(senderAddress, transaction, networkId) {
  if (Array.isArray(transaction)) {
    if (transaction.length > 1) {
      transaction = await multiMessage(transaction, networkId)
    } else {
      transaction = transaction[0]
    }
  }

  const api = await getAPI(networkId)
  const nonce = (await api.derive.balances.account(senderAddress)).accountNonce
  let options
  let blockNumber

  // Get current block if we want to modify the number of blocks we have to sign
  const signedBlock = await api.rpc.chain.getBlock()
  options = {
    blockHash: signedBlock.block.header.hash,
    era: api.createType("ExtrinsicEra", {
      current: signedBlock.block.header.number,
      period: 50,
    }),
    nonce,
  }
  blockNumber = signedBlock.block.header.number

  const payload = api.createType("SignerPayload", {
    version: api.extrinsicVersion,
    runtimeVersion: api.runtimeVersion,
    genesisHash: api.genesisHash,
    ...options,
    address: senderAddress,
    method: transaction.method,
    blockNumber,
  })

  return { payload, transaction }
}

// just for completeness in here
const curvePrefixes = {
  ed25519: [0],
  sr25519: [1],
}

function formatSignature(rawSignature) {
  const prefix = new Uint8Array(curvePrefixes["sr25519"])
  const signature = u8aToHex(u8aConcat(prefix, rawSignature))
  return signature
}

export function getSignableObject(chainMessages) {
  return chainMessages
}

export function getBroadcastableObject(
  chainMessages,
  transactionData,
  { transaction, payload, rawSignature }
) {
  const signature = formatSignature(rawSignature)

  transaction.addSignature(
    payload.address.toJSON(),
    signature,
    payload.toPayload()
  )

  const signedMessage = transaction.toJSON()
  return signedMessage
}
