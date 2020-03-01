export const getTransactionSigner = async context => {
  switch (context.networkId) {
    case `local-cosmos-hub-testnet`:
    case `terra-mainnet`:
    case `terra-testnet`:
    case `emoney-mainnet`:
    case `emoney-testnet`:
    case `cosmos-hub-mainnet`:
    case `cosmos-hub-testnet`: {
      const { createSignedTransaction } = await import("cosmos-apiV2")
      return createSignedTransaction
    }
    case "regen-mainnet":
    case "regen-testnet": {
      const { createSignedTransaction } = await import("cosmos-apiV0")
      return createSignedTransaction
    }
  }
  throw Error("Network is not supported for signing transactions.")
}

/* istanbul ignore next */
async function getMessageFormatter(network, messageType) {
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

export async function getMessage(network, messageType, senderAddress, message) {
  const messageFormatter = await getMessageFormatter(network, messageType)
  return messageFormatter(senderAddress, message)
}
