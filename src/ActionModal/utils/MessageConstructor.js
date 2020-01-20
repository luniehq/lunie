export const getMessage = async (
  messageType,
  transactionProperties,
  context
) => {
  const messageConstructor = await getMessageConstructor(context)
  const message = messageConstructor(
    messageType,
    context.userAddress,
    transactionProperties
  )
  return message
}

const getMessageConstructor = async context => {
  switch (context.networkId) {
    case `local-cosmos-hub-testnet`:
    case `terra-mainnet`:
    case `terra-testnet`:
    case `emoney-mainnet`:
    case `emoney-testnet`:
    case `cosmos-hub-mainnet`:
    case `cosmos-hub-testnet`: {
      const { default: Cosmos } = await import("cosmos-apiV2")
      const cosmos = new Cosmos(context.url || "", context.chainId || "")
      return (messageType, userAddress, transactionProperties) =>
        cosmos[messageType](userAddress, transactionProperties)
    }
    case "regen-mainnet":
    case "regen-testnet": {
      const { default: Cosmos } = await import("cosmos-apiV0")
      const cosmos = new Cosmos(context.url || "", context.chainId || "")
      return (messageType, userAddress, transactionProperties) =>
        cosmos[messageType](userAddress, transactionProperties)
    }
  }
  throw Error("Network is not supported for signing transactions.")
}

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

export const getMultiMessage = async (context, messages) => {
  switch (context.networkId) {
    case `local-cosmos-hub-testnet`:
    case `terra-mainnet`:
    case `terra-testnet`:
    case `cosmos-hub-mainnet`:
    case `cosmos-hub-testnet`: {
      const { default: Cosmos } = await import("cosmos-apiV2")
      const cosmos = new Cosmos(context.url || "", context.chainId || "")
      return cosmos.MultiMessage(context.userAddress, messages)
    }
    case "regen-mainnet":
    case "regen-testnet": {
      const { default: Cosmos } = await import("cosmos-apiV0")
      const cosmos = new Cosmos(context.url || "", context.chainId || "")
      return cosmos.MultiMessage(context.userAddress, messages)
    }
  }
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

export async function transformMessage(
  network,
  messageType,
  senderAddress,
  message
) {
  const messageFormatter = await getMessageFormatter(network, messageType)
  return messageFormatter(senderAddress, message)
}
