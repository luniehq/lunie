import 'babel-polyfill';
import { signMessageHandler, walletMessageHandler } from './messageHandlers';

global.browser = require('webextension-polyfill');

// main message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    signMessageHandler(message, sender, sendResponse);
    walletMessageHandler(message, sender, sendResponse);
  } catch (e) {
    // Return this as rejected
    console.error('Error with request', e);
  }
});
