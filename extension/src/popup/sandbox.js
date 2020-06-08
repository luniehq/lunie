// actions that need a looser CSP like WASM operations

import { getWallet } from 'app/src/vuex/modules/wallet'

window.addEventListener('message', async function (event) {
  var type = event.data.type
  var seedPhrase = event.data.seedPhrase
  var networkObject = event.data.networkObject

  if (type === 'getWallet') {
    const result = await getWallet(seedPhrase, networkObject)
    event.source.postMessage(
      {
        result
      },
      event.origin
    )
  }
})
