import 'babel-polyfill'
import { signMessageHandler, walletMessageHandler } from './messageHandlers'

global.browser = require('webextension-polyfill')

const extensionHost = location.href
  .split('/')
  .reverse()
  .slice(1)
  .reverse()
  .join('/')
const whitelisted = ['https://lunie.io', 'https://www.lunie.io', extensionHost]
if (process.env.NODE_ENV === 'development') {
  whitelisted.push('https://localhost')
}

// main message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!senderAllowed(sender)) {
    console.error('Sender is not whitelisted')
    return
  }

  try {
    signMessageHandler(message, sender, sendResponse)
    walletMessageHandler(message, sender, sendResponse)
  } catch (e) {
    // Return this as rejected
    console.error('Error with request', e)
    sendResponse({ error: error.message })
  }

  return true
})

// only allow whitelisted websites to send us messages
function senderAllowed(sender) {
  // if sender.tab is not defined, the message comes from the extension
  if (sender.tab && !whitelisted.find(url => sender.tab.url.startsWith(url))) {
    return false
  }
  return true
}
