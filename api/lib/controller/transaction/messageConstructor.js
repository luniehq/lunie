const cosmosapiV0 = require('../../../cosmos-api-v0-0.1.2/').default
const cosmosapiV2 = require('../../../cosmos-api-v0-0.2.2/').default

function getMessage(messageType, transactionProperties, context) {
  const messageConstructor = getMessageConstructor(context)
  const message = messageConstructor(
    messageType,
    context.userAddress,
    transactionProperties
  )
  return message
}

function getMessageConstructor({ networkId, url, chainId }) {
  switch (networkId) {
    case `local-cosmos-hub-testnet`:
    case `cosmos-hub-mainnet`: {
      const cosmos = new cosmosapiV0(url || '', chainId || '')
      return (messageType, userAddress, transactionProperties) =>
        cosmos[messageType](userAddress, transactionProperties)
    }
    case `cosmos-hub-testnet`: {
      const cosmos = new cosmosapiV2(url || '', chainId || '')
      return (messageType, userAddress, transactionProperties) =>
        cosmos[messageType](userAddress, transactionProperties)
    }
  }
  throw Error('Network is not supported for signing transactions.')
}

function getMultiMessage({ userAddress, networkId, url, chainId }, messages) {
  switch (networkId) {
    case `local-cosmos-hub-testnet`:
    case `cosmos-hub-mainnet`: {
      const cosmos = new cosmosapiV0(url || '', chainId || '')
      return cosmos.MultiMessage(userAddress, messages)
    }
    case `cosmos-hub-testnet`: {
      const cosmos = new cosmosapiV2(url || '', chainId || '')
      return cosmos.MultiMessage(userAddress, messages)
    }
  }
}

module.exports = {
  getMessage,
  getMultiMessage
}
