console.log('Hello Lunie Toonie');

// var port = chrome.runtime.connect();
// port.postMessage({ type: 'LUNIE_EXTENSION', text: 'hello' }, '*');
window.postMessage({ type: 'LUNIE_EXTENSION', enabled: true }, '*');

// window.addEventListener(
//   'message',
//   function(event) {
//     // We only accept messages from ourselves
//     if (event.source !== window) return;

//     if (event.data.type && event.data.type === 'FROM_PAGE') {
//       console.log('Content script received: ' + event.data.text);
//       port.postMessage({ type: 'FROM_EXTENSION', text: 'Hello from the extension!' }, '*');
//     }
//   },
//   false
// );
