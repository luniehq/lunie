import 'core-js/stable'
import 'regenerator-runtime/runtime'
import { signMessageHandler, walletMessageHandler } from './messageHandlers'
import SignRequestQueue from './requests'
import { bindRequestsToTabs } from './tabsHandler'

global.browser = require('webextension-polyfill')

const extensionHost = location.origin
const whitelisted = ['https://app.lunie.io', extensionHost]
if (process.env.NODE_ENV === 'development') {
  whitelisted.push('http://localhost')
}

const signRequestQueue = new SignRequestQueue()
signRequestQueue.unqueueSignRequest('')

// main message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!senderAllowed(sender)) {
    console.error('Sender is not whitelisted')
    return
  }

  try {
    signMessageHandler(signRequestQueue, message, sender, sendResponse)
    walletMessageHandler(message, sender, sendResponse)
  } catch (error) {
    // Return this as rejected
    console.error('Error with request', error)
    sendResponse({ error: error.message })
  }

  return true
})
bindRequestsToTabs(signRequestQueue, whitelisted)

// only allow whitelisted websites to send us messages
function senderAllowed(sender) {
  // if sender.tab is not defined, the message comes from the extension
  if (sender.tab && !whitelisted.find(url => sender.tab.url.startsWith(url))) {
    return false
  }
  return true
}
