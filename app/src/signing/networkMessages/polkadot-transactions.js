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

export async function multiMessage(transactions, api) {
  return api.tx.utility.batch(transactions)
}

/**
 * Entry point of the script.
 */
export async function getSignMessage(senderAddress, transaction, api) {
  if (Array.isArray(transaction)) {
    if (transaction.length > 1) {
      transaction = await multiMessage(transaction, api)
    } else {
      transaction = transaction[0]
    }
  }

  return {
    transaction,
  }
}

export function getSignableObject(chainMessages) {
  return chainMessages
}

export function getBroadcastableObject(
  chainMessages,
  transactionData,
  { signedMessage }
) {
  return signedMessage
}
