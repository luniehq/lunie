"use strict"

const LUNIE_EXT_TYPE = "FROM_LUNIE_EXTENSION"
const LUNIE_WEBSITE_TYPE = "FROM_LUNIE_IO"

const unWrapMessageFromContentScript = (data) => data.message

// ---- Incoming messages -----

// processes incoming messages from the browser extension
// eslint-disable-next-line no-unused-vars
let extensionAvailable = false
const processMessage = (store, type, payload) => {
  switch (type) {
    case "INIT_EXTENSION":
      extensionAvailable = true
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

const pollExtensionAvailability = async () => {
  if (!extensionAvailable) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    sendMessageToContentScript(undefined, true)
    pollExtensionAvailability()
  }
}

const filterExtensionMessage = (callback) => (message) => {
  if (message.source !== window) return
  const { data } = message
  if (data.type && data.type === LUNIE_EXT_TYPE) {
    callback(data)
  }
}

// exported for easier testing
export const processLunieExtensionMessages = (store) =>
  filterExtensionMessage((data) => {
    const message = unWrapMessageFromContentScript(data)
    processMessage(store, message.type, message.payload)
  })

// listen to incoming events
export const listenToExtensionMessages = (store) => {
  const handler = processLunieExtensionMessages(store)
  window.addEventListener("message", handler)
  pollExtensionAvailability()
}

// ---- Querying -----

const sendMessageToContentScript = (payload, skipResponse = false) => {
  window.postMessage({ type: LUNIE_WEBSITE_TYPE, payload, skipResponse }, "*")
}

// react to certain response type
function waitForResponse(type, antifreeze = false) {
  return new Promise((resolve) => {
    let timeout = antifreeze && setTimeout(() => resolve({}), 500) // hacky fix to prevent freezing
    const handler = filterExtensionMessage((data) => {
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

export const getAccountsFromExtension = () => {
  sendMessageToContentScript({ type: "GET_WALLETS" })
}

export const getSignQueue = async () => {
  const { amount } = await sendAsyncMessageToContentScript(
    {
      type: "LUNIE_GET_SIGN_QUEUE",
      payload: {},
    },
    true
  )

  return amount
}

export const deleteAccount = async (address) => {
  const boolean = await sendAsyncMessageToContentScript(
    {
      type: "DELETE_WALLET_WITHOUT_PASSWORD",
      payload: { address },
    },
    true
  )

  return boolean
}

export const signWithExtension = async (
  messageType,
  message,
  transactionData,
  senderAddress,
  network
) => {
  const signedContext = await sendAsyncMessageToContentScript({
    type: "LUNIE_SIGN_REQUEST",
    payload: {
      messageType,
      message,
      transactionData,
      senderAddress,
      network: network.id,
    },
  })

  return signedContext
}

export const cancelSignWithExtension = async (senderAddress, network) => {
  await sendAsyncMessageToContentScript({
    type: "LUNIE_SIGN_REQUEST_CANCEL",
    payload: {
      senderAddress,
      network: network.id,
    },
  })

  return true
}
