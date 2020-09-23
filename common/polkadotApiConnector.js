/* eslint-disable */ 
// in the polkadotAPIs Object we will store all the different Polkadot APIs to sign in extension
let polkadotAPIs = {}

export async function getPolkadotAPI(polkadotNetwork) {
  if (!polkadotAPIs[polkadotNetwork.id]) {
    const { WsProvider, ApiPromise } = await import('@polkadot/api')
    const endpoint = polkadotNetwork.rpc_url
    const polkadotAPI = new ApiPromise({
      provider: new WsProvider(endpoint)
    })
    // store it in the polkadotAPIs Object for a later use
    polkadotAPIs[polkadotNetwork.id] = polkadotAPI
  }
  await polkadotAPIs[polkadotNetwork.id].isReady
  return polkadotAPIs[polkadotNetwork.id]
}
