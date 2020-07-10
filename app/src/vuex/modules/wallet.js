// creates a cosmos addres for the network desired
function getCosmosAddressCreator(bech32Prefix, network, attempt) {
  return async (seedPhrase) => {
    const { getNewWalletFromSeed } = await import("@lunie/cosmos-keys")
    return {
      wallet: JSON.parse(
        JSON.stringify(getNewWalletFromSeed(seedPhrase, bech32Prefix))
      ),
      attempt,
    }
  }
}

// creates a polkadot address
async function createPolkadotAddress(seedPhrase, network, attempt) {
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
  const HDPathsOrAlgos = JSON.parse(network.HDPathsOrAlgos)

  if (attempt) {
    attempt = numberAttemptsController(HDPathsOrAlgos, attempt)
  }

  const keyring = new Keyring({
    ss58Format: Number(network.address_prefix),
    type: HDPathsOrAlgos[attempt],
  })
  const newPair = keyring.addFromUri(seedPhrase)

  return {
    wallet: {
      cosmosAddress: newPair.address,
      publicKey: newPair.publicKey,
      seedPhrase,
    },
    accountType: HDPathsOrAlgos[attempt], // accountType refers to the algo that created this account
    attempt,
  }
}

export async function getWallet(seedPhrase, network, attempt) {
  switch (network.network_type) {
    case "cosmos": {
      const addressCreator = await getCosmosAddressCreator(
        network.address_prefix,
        network,
        attempt
      )
      return await addressCreator(seedPhrase)
    }
    case "polkadot": {
      return await createPolkadotAddress(seedPhrase, network, attempt)
    }
    default:
      throw new Error(
        "Lunie doesn't support address creation for this network."
      )
  }
}

function numberAttemptsController(HDPathsOrAlgos, attempt) {
  if (attempt >= HDPathsOrAlgos.length) {
    return attempt - HDPathsOrAlgos.length
  } else {
    return attempt
  }
}
