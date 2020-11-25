import 'core-js/stable'
import 'regenerator-runtime/runtime'
import { signMessageHandler, walletMessageHandler } from './messageHandlers'
import SignRequestQueue from './requests'
import { bindRequestsToTabs } from './tabsHandler'

global.browser = require('webextension-polyfill')

const extensionHost = location.origin
const whitelisted = [
  'https://app.lunie.io',
  'https://wallet.e-money.com',
  'https://lunie.cosmos.network',
  'https://lunie-akash.vitwit.com',
  /https:\/\/\w+--lunieio.netlify.com/, // to use the extension with deployment previews
  extensionHost
]
if (process.env.NODE_ENV === 'development') {
  whitelisted.push('https://localhost')
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

// only allow whitelisted websites to send us messages
function senderAllowed(sender) {
  // if sender.tab is not defined, the message comes from the extension
  if (sender.tab && !whitelistedChecker(sender.tab.url)) {
    return false
  }
  return true
}

const whitelistedChecker = (url) => {
  return !!whitelisted.find((whitelistedUrl) => {
    // check regexps
    if (whitelistedUrl instanceof RegExp) {
      whitelistedUrl.exec(url)
      return whitelistedUrl.lastIndex === 0 // check if the regex matches on index 0 (to avoid any possible hack later on)
    }
    // prefer normal strings as easier to read and error check
    return url.startsWith(whitelistedUrl)
  })
}

bindRequestsToTabs(signRequestQueue, whitelistedChecker)
