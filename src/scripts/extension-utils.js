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
  }
}

const filterExtensionMessage = (store, callback) => message => {
  if (message.source !== window) return
  const { data } = message
  if (data.type && data.type === LUNIE_EXT_TYPE) {
    callback(data)
  }
}

// exported for easyier testing
export const processLunieExtensionMessages = store =>
  filterExtensionMessage(store, data => {
    const message = unWrapMessageFromContentScript(data)
    processMessage(store, message.type, message.payload)
  })

// listen to incoming events
export const listenToExtensionMessages = store => {
  const handler = processLunieExtensionMessages(store)
  window.addEventListener("message", handler)
}

// ---- Querying -----

const sendMessageToContentScript = payload => {
  window.postMessage(
    { type: LUNIE_WEBSITE_TYPE, payload, skipResponse: false },
    "*"
  )
}

const sendAsyncMessageToContentScript = payload => {
  sendMessageToContentScript(payload)

  // await async response
  return new Promise((resolve, reject) => {
    window.addEventListener(`${payload.type}_RESPONSE`, function(payload) {
      if (payload.rejected) {
        reject("User rejected action in extension.")
        return
      }
      resolve(payload)
    })
  })
}

export const getAccounts = () => {
  sendMessageToContentScript({
    type: "GET_WALLETS"
  })
}

export const signWithExtension = async (signMessage, senderAddress) => {
  const { signature, publicKey } = await sendAsyncMessageToContentScript({
    type: "LUNIE_SIGN_REQUEST",
    payload: {
      signMessage,
      senderAddress
    }
  })

  return {
    signature: Buffer.from(signature, "hex"),
    publicKey: Buffer.from(publicKey, "hex")
  }
}
