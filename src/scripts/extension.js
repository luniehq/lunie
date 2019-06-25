"use strict"

const LUNIE_EXT_TYPE = "FROM_LUNIE_EXTENSION"
const LUNIE_WEBSITE_TYPE = "FROM_LUNIE_IO"

// old bind usage
export function listenForExtension(store, { data }) {
  if (data.type === "LUNIE_EXTENSION") {
    console.log("Woah! You have the Lunie Extension installed!")
    store.dispatch("setExtensionStatus", true)
  }
}

export const processDataFromContentScript = callback => {
  return message => {
    if (message.source !== window) return
    const { data } = message
    if (data.type && data.type === LUNIE_EXT_TYPE) {
      console.log("Ext. Received from content script:", data.payload)
      callback(data.payload)
    }
  }
}

export const sendMessageToContentScript = message => {
  console.log("Ext. Sending message to content sciprt", message)
  window.postMessage({ type: LUNIE_WEBSITE_TYPE, message }, "*")
}
