import 'babel-polyfill';
const { getWalletIndex, getStoredWallet, signWithPrivateKey, getNewWallet, storeWallet, getNewWalletFromSeed, removeWallet, getSeed } = require('@lunie/cosmos-keys');
const { createSignMessage } = require('@lunie/cosmos-api');

global.browser = require('webextension-polyfill');

// TODO handle requests from sign-request-popup (message, password)

// TODO handle requests from account-management-popup (create account | delete account | import account [| rename account])

// main message handler
chrome.runtime.onMessage.addListener((message, sender, callback) => {
  signMessageHandler(message, sender, callback);
  walletMessageHandler(message, sender, callback);
});

// open request popup
// chrome.tabs.create({ url: chrome.extension.getURL('./request/request.html') }, function(tab) {
// });

function signMessageHandler(message, sender, callback) {
  switch (message.type) {
    case 'SIGN_REQUEST': {
      const { stdTx, senderAddress } = message.payload;
      const wallet = getWalletFromIndex(getWalletIndex(), senderAddress);
      // ... Open or signal sign request
      break;
    }
    case 'SIGN': {
      const { stdTx, senderAddress, password, chainId, sequence, accountNumber } = message.payload;
      const wallet = getStoredWallet(senderAddress, password);

      const signMessage = createSignMessage(stdTx, { sequence, accountNumber, chainId });
      const signature = signWithPrivateKey(signMessage, Buffer.from(wallet.privateKey, 'hex'));
      // ... Send back to Lunie
      break;
    }
  }
}
function walletMessageHandler(message, sender, callback) {
  switch (message.type) {
    case 'GET_SEED': {
      callback(getSeed());
      break;
    }
    case 'GET_WALLETS': {
      callback(getWalletIndex());
      break;
    }
    case 'CREATE_WALLET': {
      const { name, password } = message.payload;
      const wallet = getNewWallet();
      storeWallet(wallet, name, password);
      callback();
      break;
    }
    case 'IMPORT_WALLET': {
      const { name, password, mnemonic } = message.payload;
      const wallet = getNewWalletFromSeed(mnemonic);
      storeWallet(wallet, name, password);
      callback();
      break;
    }
    case 'DELETE_WALLET': {
      const { address, password } = message.payload;
      removeWallet(address, password);
      callback();
      break;
    }
  }
}

function getWalletFromIndex(walletIndex, address) {
  return walletIndex.find(({ address: storedAddress }) => storedAddress === address);
}
