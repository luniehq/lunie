const { loadKeys, importKey, testPassword } = require('scripts/keystore.js');
const { getSeed } = require('@lunie/cosmos-keys');

global.browser = require('webextension-polyfill');

// TODO intialise/load database on boot (put keystore into a module and make it use leveldb?)

// TODO handle requests from sign-request-popup (message, password)

// TODO handle requests from account-management-popup (create account | delete account | import account [| rename account])

// open request popup
// chrome.tabs.create({ url: chrome.extension.getURL('./request/request.html') }, function(tab) {});
