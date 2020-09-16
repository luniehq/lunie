/* eslint-disable */ 
// in the polkadotAPIs Object we will store all the different Polkadot APIs to sign in extension
let polkadotAPIs = {}

export async function getPolkadotAPI(polkadotNetwork) {
  if (!polkadotAPIs[polkadotNetwork.id]) {
    const { ApiPromise } = await import('@polkadot/api')
    const { HttpProvider } = await import('@polkadot/rpc-provider')
    const endpoint = polkadotNetwork.rpc_url
    const polkadotAPI = ApiPromise.create({
      provider: new HttpProvider(endpoint.replace('wss', 'https').replace('/ws', '/rpc'))
    })
    // store it in the polkadotAPIs Object for a later use
    polkadotAPIs[polkadotNetwork.id] = polkadotAPI
  }
  await polkadotAPIs[polkadotNetwork.id].isReady
  return polkadotAPIs[polkadotNetwork.id]
}
