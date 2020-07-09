import { mapGetters } from "vuex"

// creates a cosmos addres for the network desired
function getCosmosAddressCreator(bech32Prefix) {
  return async (seedPhrase) => {
    const { getNewWalletFromSeed } = await import("@lunie/cosmos-keys")
    return getNewWalletFromSeed(seedPhrase, bech32Prefix)
  }
}

// creates a polkadot address
async function createPolkadotAddress(seedPhrase, addressPrefix) {
  const [{ Keyring }] = await Promise.all([
    import("@polkadot/api"),
    import("@polkadot/wasm-crypto").then(async ({ waitReady }) => {
      await waitReady()
    }),
    import("@polkadot/util-crypto").then(async ({ cryptoWaitReady }) => {
      // Wait for the promise to resolve, async WASM or `cryptoWaitReady().then(() => { ... })`
      await cryptoWaitReady()
    }),
  ])

  const keyring = new Keyring({
    ss58Format: Number(addressPrefix),
    type: [...mapGetters([`polkadotAlgo`])]
  })
  const newPair = keyring.addFromUri(seedPhrase)

  return {
    cosmosAddress: newPair.address,
    publicKey: newPair.publicKey,
    seedPhrase,
  }
}

export async function getWallet(seedPhrase, network) {
  switch (network.network_type) {
    case "cosmos": {
      const addressCreator = await getCosmosAddressCreator(
        network.address_prefix
      )
      return await addressCreator(seedPhrase)
    }
    case "polkadot": {
      return await createPolkadotAddress(seedPhrase, network.address_prefix)
    }
    default:
      throw new Error(
        "Lunie doesn't support address creation for this network."
      )
  }
}
