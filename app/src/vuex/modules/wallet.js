// creates a cosmos addres for the network desired
function getCosmosAddressCreator(bech32Prefix, accountType) {
  return async (seedPhrase) => {
    const { getNewWalletFromSeed } = await import("@lunie/cosmos-keys")
    return getNewWalletFromSeed(seedPhrase, bech32Prefix, accountType)
  }
}

// creates a polkadot address
async function createPolkadotAddress(seedPhrase, network, accountType) {
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
    type: accountType,
  })
  const newPair = keyring.addFromUri(seedPhrase)

  return {
    cosmosAddress: newPair.address,
    publicKey: newPair.publicKey,
    seedPhrase,
    accountType,
  }
}

export async function getWallet(seedPhrase, network, accountType) {
  // accountType refers to the algo that creates this account
  switch (network.network_type) {
    case "cosmos": {
      const addressCreator = await getCosmosAddressCreator(
        network.address_prefix,
        accountType
      )
      return await addressCreator(seedPhrase)
    }
    case "polkadot": {
      return await createPolkadotAddress(seedPhrase, network, accountType)
    }
    default:
      throw new Error(
        "Lunie doesn't support address creation for this network."
      )
  }
}

export async function getWalletWithRetry(seedPhrase, network, attempt) {
  const HDPathsOrAlgos = JSON.parse(network.HDPathsOrAlgos)
  // control the attempt/retry index before selecting the algo from Array
  if (attempt) {
    attempt = numberAttemptsController(HDPathsOrAlgos, attempt)
  }
  const HDPathOrAlgo = attempt ? HDPathsOrAlgos[attempt] : HDPathsOrAlgos[0]
  return {
    wallet: await getWallet(seedPhrase, network, HDPathOrAlgo),
    attempt,
  }
}

function numberAttemptsController(HDPathsOrAlgos, attempt) {
  if (attempt >= HDPathsOrAlgos.length) {
    return attempt - HDPathsOrAlgos.length
  } else {
    return attempt
  }
}
