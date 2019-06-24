const { createSignMessage } = require('@lunie/cosmos-api');
const { getWalletIndex, getStoredWallet, signWithPrivateKey, testPassword, storeWallet, getNewWalletFromSeed, removeWallet, getSeed } = require('@lunie/cosmos-keys');

let signRequestQueue = [];
unqueueSignRequest(''); // restart icons on restart

export function signMessageHandler(message, sender, sendResponse) {
  switch (message.type) {
    case 'SIGN_REQUEST': {
      const { stdTx, senderAddress } = message.payload;
      const wallet = getWalletFromIndex(getWalletIndex(), senderAddress);
      if (!wallet) {
        throw new Error('No wallet found matching the sender address.');
      }
      queueSignRequest({ stdTx, senderAddress });
      break;
    }
    case 'SIGN': {
      const { stdTx, senderAddress, password, chainId, sequence, accountNumber, id } = message.payload;
      const wallet = getStoredWallet(senderAddress, password);

      const signMessage = createSignMessage(stdTx, { sequence, accountNumber, chainId });
      const signature = signWithPrivateKey(signMessage, Buffer.from(wallet.privateKey, 'hex'));
      sendResponse(signature);
      unqueueSignRequest(id);
      break;
    }
    case 'GET_SIGN_REQUEST': {
      sendResponse(signRequestQueue.length > 0 ? signRequestQueue[0] : undefined);
      break;
    }
    case 'DISAPPROVE_SIGN_REQUEST': {
      const { id } = message.payload;
      unqueueSignRequest(id);
      break;
    }
  }
}
export function walletMessageHandler(message, sender, sendResponse) {
  switch (message.type) {
    case 'GET_SEED': {
      sendResponse(getSeed());
      break;
    }
    case 'GET_WALLETS': {
      sendResponse(getWalletIndex());
      break;
    }
    case 'IMPORT_WALLET': {
      const { name, password, mnemonic } = message.payload;
      const wallet = getNewWalletFromSeed(mnemonic);
      storeWallet(wallet, name, password);
      sendResponse();
      break;
    }
    case 'DELETE_WALLET': {
      const { address, password } = message.payload;
      removeWallet(address, password);
      sendResponse();
      break;
    }
    case 'TEST_PASSWORD': {
      const { address, password } = message.payload;
      try {
        testPassword(address, password);
        sendResponse(true);
      } catch (error) {
        sendResponse(false);
      }
      break;
    }
  }
}

function getWalletFromIndex(walletIndex, address) {
  return walletIndex.find(({ address: storedAddress }) => storedAddress === address);
}

function queueSignRequest({ stdTx, senderAddress }) {
  signRequestQueue.push({ stdTx, senderAddress, id: Date.now() });
  chrome.browserAction.setIcon({ path: 'icons/icon-alert-128x128.png' });
}

function unqueueSignRequest(id) {
  signRequestQueue = signRequestQueue.filter(({ id: storedId }) => storedId !== id);
  if (signRequestQueue.length === 0) {
    chrome.browserAction.setIcon({ path: 'icons/128x128.png' });
  }
}
