console.log('EXT Content Script Loaded');
// As we use the `window` object as a message broker, we need to differentiate between targets of the messages we send via the broker.

const LUNIE_EXT_TYPE = 'FROM_LUNIE_EXTENSION';
const LUNIE_WEBSITE_TYPE = 'FROM_LUNIE_IO';

const wrapMessageForLunie = (type, payload) => {
  return {
    type: LUNIE_EXT_TYPE,
    message: {
      type,
      payload,
    },
  };
};

function enableExtension() {
  const message = wrapMessageForLunie('INIT_EXTENSION', { extension_enabled: true });
  window.postMessage(message, '*');
}

enableExtension();

// Listen to messages from the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const wrappedMessage = wrapMessageForLunie(message.type, message.payload);

  // Post reply to Lunie.io
  window.postMessage(wrappedMessage, '*');
});

// Listen to Lunie.io
window.addEventListener(
  'message',
  function(event) {
    // We only accept messages from ourselves
    if (event.source !== window) return;

    if (event.data.type && event.data.type === LUNIE_WEBSITE_TYPE) {
      const { payload, skipResponse } = event.data;

      // on async responses we don't want to wait for a response right away
      // waiting causes console errors
      const responseHandler = skipResponse
        ? undefined
        : function(response) {
            if (skipResponse) return;

            const data = { responseType: `${payload.type}_RESPONSE`, payload: response };
            const wrappedMessage = wrapMessageForLunie(data.responseType, data.payload);

            // Post reply to Lunie.io
            window.postMessage(wrappedMessage, '*');
          };

      // Forward request to backgroud
      chrome.runtime.sendMessage(payload, responseHandler);
    }
  },
  false
);
