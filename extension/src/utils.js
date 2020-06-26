export async function getPolkadotAPI(polkadotNetwork) {
  const { WsProvider, ApiPromise } = await import('@polkadot/api')
  const endpoint = polkadotNetwork.rpc_url
  const polkadotAPI = new ApiPromise({
    provider: new WsProvider(endpoint)
  })
  await polkadotAPI.isReady
  return polkadotAPI
}
