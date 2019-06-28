"use strict"

const LUNIE_EXT_TYPE = "FROM_LUNIE_EXTENSION"
const LUNIE_WEBSITE_TYPE = "FROM_LUNIE_IO"

// old bind usage
export function listenForExtension(store, { data }) {
  if (data.type === "INIT_EXTENSION") {
    console.log("Woah! You have the Lunie Extension installed!")
    store.dispatch("setExtensionStatus", true)
  }
}

const unWrapMessageFromContentScript = data => data.message

const processMessage = (store, type, payload) => {
  switch (type) {
    case "INIT_EXTENSION":
      store.dispatch("setExtensionEnabled")
      store.dispatch("getAddressesFromExtension")
      break
    case "GET_WALLETS_RESPONSE":
      store.commit("setWallets", payload)
      break
    default:
      return
  }
}

export const processLunieExtensionMessages = store => {
  return message => {
    if (message.source !== window) return
    const { data } = message
    if (data.type && data.type === LUNIE_EXT_TYPE) {
      const message = unWrapMessageFromContentScript(data)
      console.log("Ext. Received from content script:", message)
      processMessage(store, message.type, message.payload)
    }
  }
}

export const sendMessageToContentScript = payload => {
  console.log("Ext. Sending message to content script", payload)
  window.postMessage({ type: LUNIE_WEBSITE_TYPE, payload }, "*")
}

export const getWallets = () => {
  sendMessageToContentScript({ type: "GET_WALLETS" })
}

export const sign = (signMessage, senderAddress) => {
  sendMessageToContentScript({
    type: "LUNIE_SIGN_REQUEST",
    payload: {
      signMessage,
      senderAddress
    }
  })

  return new Promise((resolve, reject) => {
    window.addEventListener("LUNIE_SIGN_REQUEST_RESPONSE", function({
      signature,
      publicKey,
      rejected
    }) {
      if (rejected) {
        reject()
        return
      }
      resolve({
        signature: Buffer.from(signature, "hex"),
        publicKey: Buffer.from(publicKey, "hex")
      })
    })
  })
}
