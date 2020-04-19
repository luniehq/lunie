"use strict"

const LUNIE_EXT_TYPE = "FROM_LUNIE_EXTENSION"
const LUNIE_WEBSITE_TYPE = "FROM_LUNIE_IO"

const unWrapMessageFromContentScript = data => data.message

// ---- Incoming messages -----

// processes incoming messages from the browser extension
// eslint-disable-next-line no-unused-vars
const processMessage = (store, type, payload) => {
  switch (type) {
    case "INIT_EXTENSION":
      store.commit("setExtensionAvailable")
      store.dispatch("getAddressesFromExtension")
      break
    case "GET_WALLETS_RESPONSE":
      store.commit("setExtensionAccounts", payload)
      break
    default:
      return
  }
}

const filterExtensionMessage = callback => message => {
  if (message.source !== window) return
  const { data } = message
  if (data.type && data.type === LUNIE_EXT_TYPE) {
    callback(data)
  }
}

// exported for easier testing
export const processLunieExtensionMessages = store =>
  filterExtensionMessage(data => {
    const message = unWrapMessageFromContentScript(data)
    processMessage(store, message.type, message.payload)
  })

// listen to incoming events
export const listenToExtensionMessages = store => {
  const handler = processLunieExtensionMessages(store)
  window.addEventListener("message", handler)
}

// ---- Querying -----

const sendMessageToContentScript = (payload, skipResponse = false) => {
  window.postMessage({ type: LUNIE_WEBSITE_TYPE, payload, skipResponse }, "*")
}

// react to certain response type
function waitForResponse(type, antifreeze = false) {
  return new Promise(resolve => {
    let timeout = antifreeze && setTimeout(() => resolve({}), 500) // hacky fix to prevent freezing
    const handler = filterExtensionMessage(data => {
      const message = unWrapMessageFromContentScript(data)
      if (message.type === type) {
        antifreeze && clearTimeout(timeout)
        resolve(message.payload)
      }

      // cleanup
      window.removeEventListener("message", handler)
    })
    window.addEventListener("message", handler)
  })
}

const sendAsyncMessageToContentScript = async (payload, antifreeze = false) => {
  console.log(payload)
  // I think we can deal with async console errors problems by returning true
  sendMessageToContentScript(payload, true)

  // await async response
  const response = await waitForResponse(`${payload.type}_RESPONSE`, antifreeze)
  if (response.rejected) {
    throw new Error("User rejected action in extension.")
  }
  if (response.error) {
    throw new Error(response.error)
  }
  return response
}

const lunieTransactionGetFrom = (transactionData, senderAddress) => {
  switch (transactionData.type) {
    case "RestakeTx":
      return transactionData.validatorSourceAddress
    case "ClaimRewardsTx":
      return transactionData.validatorRewards
    default:
      return senderAddress
  }
}

const lunieTransactionGetTo = transactionData => {
  switch (transactionData.type) {
    case "StakeTx":
      return transactionData.validatorAddress
    case "RestakeTx":
      return transactionData.validatorDestinationAddress
    case "SendTx":
      return transactionData.toAddress
    default:
      return ""
  }
}

const createLunieTransaction = (transactionData, senderAddress) => {
  return {
    type: transactionData.type,
    details: {
      // HACK: we add here all possible details for every transaction type
      amount: transactionData.displayAmount || {},
      from: lunieTransactionGetFrom(transactionData, senderAddress),
      to: lunieTransactionGetTo(transactionData),
      liquidDate: transactionData.liquidDate || "",
      amounts: transactionData.displayAmounts || [],
      proposalType: transactionData.proposalType || "",
      proposalTitle: transactionData.proposalTitle || "",
      proposalDescription: transactionData.proposalDescription || "",
      initialDeposit: transactionData.initialDeposits || "",
      voteOption: transactionData.voteOption || ""
    },
    fees: {
      amount: transactionData.fee.amount || 0,
      denom: transactionData.fee.denom || ""
    }
  }
}

export const getAccountsFromExtension = () => {
  sendMessageToContentScript({ type: "GET_WALLETS" })
}

export const getSignQueue = async () => {
  const { amount } = await sendAsyncMessageToContentScript(
    {
      type: "LUNIE_GET_SIGN_QUEUE",
      payload: {}
    },
    true
  )

  return amount
}

export const signWithExtension = async (
  signMessage,
  senderAddress,
  network,
  transactionData,
  displayedProperties
) => {
  const lunieTransaction = createLunieTransaction(
    transactionData,
    senderAddress
  )
  const { signature, publicKey } = await sendAsyncMessageToContentScript({
    type: "LUNIE_SIGN_REQUEST",
    payload: {
      signMessage,
      senderAddress,
      network: network.id, // TODO: simplify extension by using the networkObject
      transactionData,
      displayedProperties,
      lunieTransaction,
      networkObject: network
    }
  })

  return {
    signature: Buffer.from(signature, "hex"),
    publicKey: Buffer.from(publicKey, "hex")
  }
}

export const cancelSignWithExtension = async (senderAddress, network) => {
  await sendAsyncMessageToContentScript({
    type: "LUNIE_SIGN_REQUEST_CANCEL",
    payload: {
      senderAddress,
      network
    }
  })

  return true
}
