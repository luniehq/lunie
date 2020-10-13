const {
  getWalletIndex,
  getStoredWallet,
  testPassword,
  removeWallet,
  removeFromStorage
} = require('@lunie/cosmos-keys')
const {
  default: TransactionManager
} = require('app/src/signing/transaction-manager')
const { getPolkadotAPI } = require('../../common/polkadotApiConnector')

export async function signMessageHandler(
  signRequestQueue,
  event,
  sender,
  sendResponse
) {
  switch (event.type) {
    case 'LUNIE_SIGN_REQUEST_CANCEL': {
      signRequestQueue.unqueueSignRequestForTab(sender.tab.id)
      break
    }
    case 'LUNIE_GET_SIGN_QUEUE': {
      sendAsyncResponseToLunie(sender.tab.id, {
        type: 'LUNIE_GET_SIGN_QUEUE_RESPONSE',
        payload: {
          amount: signRequestQueue.getQueueLength()
        }
      })
      break
    }
    case 'LUNIE_SIGN_REQUEST': {
      const {
        // old messaging
        signMessage, //DEPRECATE
        displayedProperties, //DEPRECATE

        messageType,
        message,
        transactionData,
        senderAddress,
        network
      } = event.payload
      const wallet = getWalletFromIndex(getWalletIndex(), senderAddress)
      if (!wallet) {
        throw new Error('No wallet found matching the sender address.')
      }

      signRequestQueue.queueSignRequest({
        signMessage, // DEPRECATE
        displayedProperties, //DEPRECATE

        messageType,
        message,
        transactionData,
        senderAddress,
        network,
        tabID: sender.tab.id
      })
      break
    }
    case 'SIGN': {
      const {
        messageType,
        message,
        transactionData,
        senderAddress,
        network,
        password,
        id,
        HDPath,
        curve
      } = event.payload

      const transactionManager = new TransactionManager()
      let polkadotAPI
      if (network.network_type === `polkadot`) {
        polkadotAPI = await getPolkadotAPI(network)
      }
      try {
        const broadcastableObject = await transactionManager.createAndSignLocally(
          messageType,
          message,
          transactionData,
          senderAddress,
          network,
          'local',
          password,
          polkadotAPI,
          HDPath,
          curve
        )
        const { tabID } = signRequestQueue.unqueueSignRequest(id)
        sendAsyncResponseToLunie(tabID, {
          type: 'LUNIE_SIGN_REQUEST_RESPONSE',
          payload: broadcastableObject
        })

        sendResponse() // to popup
      } catch (error) {
        sendResponse({ error: error.message }) // to popup
      }

      break
    }
    case 'GET_SIGN_REQUEST': {
      sendResponse(signRequestQueue.getSignRequest())
      break
    }
    case 'REJECT_SIGN_REQUEST': {
      const { id, tabID } = event.payload
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
export async function walletMessageHandler(message, sender, sendResponse) {
  switch (message.type) {
    case 'GET_WALLETS': {
      sendResponse(getWalletIndex(true))
      break
    }
    case 'DELETE_WALLET': {
      const { address, password } = message.payload
      removeWallet(address, password)
      sendResponse()
      break
    }
    case 'DELETE_WALLET_WITHOUT_PASSWORD': {
      const { address } = message.payload
      removeFromStorage(address)
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
    case 'GET_WALLET': {
      const { address, password } = message.payload
      try {
        const wallet = await getStoredWallet(address, password)
        sendResponse(wallet)
      } catch (error) {
        sendResponse()
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
