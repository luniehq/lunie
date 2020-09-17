import { Keyring } from "@polkadot/keyring"
import { cryptoWaitReady } from "@polkadot/util-crypto"

// creates a cosmos addres for the network desired
function getCosmosAddressCreator(bech32Prefix, HDPath, curve) {
  return async (seedPhrase) => {
    const { getNewWalletFromSeed } = await import("@lunie/cosmos-keys")
    return getNewWalletFromSeed(seedPhrase, bech32Prefix, HDPath, curve)
  }
}

// creates a polkadot address
async function createPolkadotAddress(seedPhrase, network, curve) {
  await cryptoWaitReady()

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

export async function getWallet(seedPhrase, network, HDPath, curve) {
  switch (network.network_type) {
    case "cosmos": {
      const addressCreator = await getCosmosAddressCreator(
        network.address_prefix,
        HDPath,
        curve
      )
      return await addressCreator(seedPhrase)
    }
    case "polkadot": {
      return await createPolkadotAddress(seedPhrase, network, curve)
    }
    default:
      throw new Error(
        "Lunie doesn't support address creation for this network."
      )
  }
}
