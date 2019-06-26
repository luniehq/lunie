import 'babel-polyfill';
import { signMessageHandler, walletMessageHandler } from './messageHandlers';

global.browser = require('webextension-polyfill');

// DEBUG
const wallets = {
  cosmos1: 100,
  cosmos2: 90,
  cosmos3: 80,
};

// main message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TEST_REQUEST') {
    sendResponse(`hello ${sender}`);
  }

  if (message.type === 'GET_WALLETS') {
    // DEBUG
    sendResponse({ wallets });
    return;
  }
  try {
    signMessageHandler(message, sender, sendResponse);
    walletMessageHandler(message, sender, sendResponse);
  } catch (e) {
    // Return this as rejected
    console.error('Error with request', e);
  }
});
