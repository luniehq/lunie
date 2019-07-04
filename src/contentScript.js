console.log('EXT Content Script Loaded');
// As we use the `window` object as a message broker, we need to differentiate between targets of the messages we send via the broker.

const LUNIE_EXT_TYPE = 'FROM_LUNIE_EXTENSION';
const LUNIE_WEBSITE_TYPE = 'FROM_LUNIE_IO';

// we wrap messages in a format to identify who messaged who
const wrapMessageForLunie = (type, payload) => {
  return {
    type: LUNIE_EXT_TYPE,
    message: {
      type,
      payload,
    },
  };
};

// signal extension availability to Lunie.io
export function enableExtension() {
  const message = wrapMessageForLunie('INIT_EXTENSION', { extension_enabled: true });
  window.postMessage(message, '*');
}

// handles syncronous responses from extension
const responseHandler = type => response => {
  const data = { responseType: `${type}_RESPONSE`, payload: response };
  const wrappedMessage = wrapMessageForLunie(data.responseType, data.payload);

  // Post reply to Lunie.io
  window.postMessage(wrappedMessage, '*');
};

// We only accept messages from ourselves
const filterMessages = callback => event => {
  if (event.source !== window) return;

  if (event.data.type && event.data.type === LUNIE_WEBSITE_TYPE) {
    callback(event.data);
  }
};

// Forward request to backgroud and handle responses to those requests
// on async responses we don't want to wait for a response right away
// waiting causes console errors
function executeRequestToExtension({ payload, skipResponse }) {
  chrome.runtime.sendMessage(payload, skipResponse ? undefined : responseHandler(payload.type));
}

// Listen to messages from the extension
export function listenToExtensionMessages() {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const wrappedMessage = wrapMessageForLunie(message.type, message.payload);

    // Post reply to Lunie.io
    window.postMessage(wrappedMessage, '*');
  });
}

// Listen to messages from Lunie.io
export function listenToWebsiteMessages() {
  window.addEventListener('message', event => filterMessages(executeRequestToExtension)(event), false);
}

function main() {
  enableExtension();
  listenToExtensionMessages();
  listenToWebsiteMessages();
}

main();
