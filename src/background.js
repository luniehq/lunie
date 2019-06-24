import 'babel-polyfill';
import { signMessageHandler, walletMessageHandler } from './messageHandlers';

global.browser = require('webextension-polyfill');

// main message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  signMessageHandler(message, sender, sendResponse);
  walletMessageHandler(message, sender, sendResponse);
});
