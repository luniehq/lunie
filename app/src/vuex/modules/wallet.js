// creates a cosmos addres for the network desired
function getCosmosAddressCreator(bech32Prefix, HDPath, curve) {
  return async (seedPhrase) => {
    const { getNewWalletFromSeed } = await import("@lunie/cosmos-keys")
    return getNewWalletFromSeed(
      seedPhrase,
      bech32Prefix,
      HDPath,
      //curve TODO,
    )
  }
}

// creates a polkadot address
async function createPolkadotAddress(seedPhrase, network, curve) {
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
    ss58Format: Number(network.address_prefix),
    type: curve,
  })
  const newPair = keyring.addFromUri(seedPhrase)

  return {
    cosmosAddress: newPair.address,
    publicKey: newPair.publicKey,
    seedPhrase,
    curve,
  }
}

export async function getWallet(seedPhrase, network, HDPathOrCurve) {
  // HDPathOrCurve refers to the algo that creates this account
  switch (network.network_type) {
    case "cosmos": {
      const HDPath = HDPathOrCurve
      const addressCreator = await getCosmosAddressCreator(
        network.address_prefix,
        HDPath
      )
      return await addressCreator(seedPhrase)
    }
    case "polkadot": {
      const curve = HDPathOrCurve
      return await createPolkadotAddress(seedPhrase, network, curve)
    }
    default:
      throw new Error(
        "Lunie doesn't support address creation for this network."
      )
  }
}

export async function getWalletWithRetry(seedPhrase, network, networkCryptoTypes, attempt) {
  const HDPathOrCurve = attempt ? networkCryptoTypes[attempt] : networkCryptoTypes[0]
  return await getWallet(seedPhrase, network, HDPathOrCurve)
}
