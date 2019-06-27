console.log('EXT Content Script Loaded');
// As we use the `window` object as a message broker, we need to differentiate between targets of the messages we send via the broker.

const LUNIE_EXT_TYPE = 'FROM_LUNIE_EXTENSION';
const LUNIE_WEBSITE_TYPE = 'FROM_LUNIE_IO';

// var port = chrome.runtime.connect();
// port.postMessage({ type: 'LUNIE_EXTENSION', text: 'hello' }, '*');

// const msg = {
//   type: LUNIE_EXT_TYPE,
//   message: {
//     type: 'GET_WALLETS_RESPONSE',
//     payload: {
//       wallets: {
//         cosmos1: 100,
//         cosmos2: 90,
//         cosmos3: 80,
//       },
//     },
//   },
// };

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

// Listen to Lunie.io
window.addEventListener(
  'message',
  function(event) {
    // We only accept messages from ourselves
    if (event.source !== window) return;

    if (event.data.type && event.data.type === LUNIE_WEBSITE_TYPE) {
      const { type, payload } = event.data;

      // Forward request to backgroud
      chrome.runtime.sendMessage(payload, function(response) {
        const data = { responseType: `${payload.type}_RESPONSE`, payload: response };
        const wrappedMessage = wrapMessageForLunie(data.responseType, data.payload);

        // Post reply to Lunie.io
        window.postMessage(wrappedMessage, '*');
      });
    }
  },
  false
);
