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
    case `cosmos-hub-mainnet`: {
      const { default: Cosmos } = await import("cosmos-apiV0")
      const cosmos = new Cosmos(context.url || "", context.chainId || "")
      return (messageType, userAddress, transactionProperties) =>
        cosmos[messageType](userAddress, transactionProperties)
    }
    case `cosmos-hub-testnet`: {
      const { default: Cosmos } = await import("cosmos-apiV2")
      const cosmos = new Cosmos(context.url || "", context.chainId || "")
      return (messageType, userAddress, transactionProperties) =>
        cosmos[messageType](userAddress, transactionProperties)
    }
  }
  throw Error("Network is not supported for signing transactions.")
}

export const getMultiMessage = async (context, messages) => {
  switch (context.networkId) {
    case `local-cosmos-hub-testnet`:
    case `cosmos-hub-mainnet`: {
      const { default: Cosmos } = await import("cosmos-apiV0")
      const cosmos = new Cosmos(context.url || "", context.chainId || "")
      return cosmos.MultiMessage(context.userAddress, messages)
    }
    case `cosmos-hub-testnet`: {
      const { default: Cosmos } = await import("cosmos-apiV2")
      const cosmos = new Cosmos(context.url || "", context.chainId || "")
      return cosmos.MultiMessage(context.userAddress, messages)
    }
  }
}
