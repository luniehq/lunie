/* returns a function which receives a signer and a transaction plus some meta data and return an object (transaction) signed and ready to be broadcasted */
export const getSignedTransactionCreator = async networkType => {
  switch (networkType) {
    case `cosmos`: {
      const { createSignedTransaction } = await import("cosmos-apiV2")
      return createSignedTransaction
    }
  }
  throw Error("Network is not supported for signing transactions.")
}

/* istanbul ignore next */
/* returns the a message creator for a specific network and transaction type */
async function getNetworkSpecificMessageCreator(network, messageType) {
  let networkMessages
  try {
    networkMessages = await import(`./networkMessages/${network}.js`)
  } catch (err) {
    throw new Error("Signing for this network is not enabled.")
  }
  const messageFormatter = networkMessages[messageType]

  if (!messageFormatter) {
    throw new Error(
      `Creating the '${messageType}' message for the ${network} network is not supported`
    )
  }

  return messageFormatter
}

/* returns a message object to be signed by a network specific signing algorithm */
export async function getMessage(network, messageType, senderAddress, message) {
  const messageFormatter = await getNetworkSpecificMessageCreator(
    network,
    messageType
  )
  return messageFormatter(senderAddress, message)
}
