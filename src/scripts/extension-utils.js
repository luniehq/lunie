"use strict"

const LUNIE_EXT_TYPE = "FROM_LUNIE_EXTENSION"
const LUNIE_WEBSITE_TYPE = "FROM_LUNIE_IO"

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

export const getWallets = () => {
  sendMessageToContentScript({ type: "GET_WALLETS" })
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
