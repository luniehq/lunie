const {
  getWalletIndex,
  getStoredWallet,
  signWithPrivateKey,
  testPassword,
  storeWallet,
  getNewWalletFromSeed,
  removeWallet,
  getSeed
} = require('@lunie/cosmos-keys')

export function signMessageHandler(
  signRequestQueue,
  message,
  sender,
  sendResponse
) {
  switch (message.type) {
    case 'LUNIE_SIGN_REQUEST': {
      const { signMessage, senderAddress } = message.payload
      const wallet = getWalletFromIndex(getWalletIndex(), senderAddress)
      if (!wallet) {
        throw new Error('No wallet found matching the sender address.')
      }
      signRequestQueue.queueSignRequest({
        signMessage,
        senderAddress,
        tabID: sender.tab.id
      })
      break
    }
    case 'SIGN': {
      const { signMessage, senderAddress, password, id } = message.payload
      const wallet = getStoredWallet(senderAddress, password)

      const { tabID } = signRequestQueue.unqueueSignRequest(id)
      const signature = signWithPrivateKey(
        signMessage,
        Buffer.from(wallet.privateKey, 'hex')
      )
      sendAsyncResponseToLunie(tabID, {
        type: 'LUNIE_SIGN_REQUEST_RESPONSE',
        payload: {
          signature: signature.toString('hex'),
          publicKey: wallet.publicKey
        }
      })
      sendResponse() // to popup
      break
    }
    case 'GET_SIGN_REQUEST': {
      sendResponse(signRequestQueue.getSignRequest())
      break
    }
    case 'REJECT_SIGN_REQUEST': {
      const { id, tabID } = message.payload
      sendAsyncResponseToLunie(tabID, {
        type: 'LUNIE_SIGN_REQUEST_RESPONSE',
        payload: { rejected: true }
      })
      signRequestQueue.unqueueSignRequest(id)
      sendResponse() // to popup
      break
    }
  }
}
export function walletMessageHandler(message, sender, sendResponse) {
  switch (message.type) {
    case 'GET_SEED': {
      sendResponse(getSeed())
      break
    }
    case 'GET_WALLETS': {
      sendResponse(getWalletIndex())
      break
    }
    case 'IMPORT_WALLET': {
      const { name, password, mnemonic } = message.payload
      const wallet = getNewWalletFromSeed(mnemonic)
      storeWallet(wallet, name, password)
      sendResponse()
      break
    }
    case 'DELETE_WALLET': {
      const { address, password } = message.payload
      removeWallet(address, password)
      sendResponse()
      break
    }
    case 'TEST_PASSWORD': {
      const { address, password } = message.payload
      try {
        testPassword(address, password)
        sendResponse(true)
      } catch (error) {
        sendResponse(false)
      }
      break
    }
  }
}

// for responses that take some time like for a sign request we can't use simple responses
// we instead send a messsage to the sending tab
function sendAsyncResponseToLunie(tabId, { type, payload }) {
  chrome.tabs.sendMessage(tabId, { type, payload })
}

function getWalletFromIndex(walletIndex, address) {
  return walletIndex.find(
    ({ address: storedAddress }) => storedAddress === address
  )
}
