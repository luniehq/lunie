import {
  signWithExtension,
  cancelSignWithExtension,
  getSignQueue
} from "src/scripts/extension-utils"

export async function cancelSign(submitType = "", { address, network }) {
  if (submitType === `extension`) {
    cancelSignWithExtension(address, network)
  }
}
export async function signQueue(submitType = "") {
  if (submitType === `extension`) {
    return getSignQueue()
  }
}

export async function getSigner(
  config,
  signingType = "",
  { address, password, network, transactionData, displayedProperties }
) {
  if (signingType === `local`) {
    const { getStoredWallet } = await import("@lunie/cosmos-keys")
    const wallet = getStoredWallet(address, password)

    switch (network.network_type) {
      case "cosmos":
        return await getCosmosLocalSigner(wallet)
      case "polkadot":
        return await getPolkadotLocalSigner(wallet)
    }
  } else if (signingType === `ledger`) {
    switch (network.network_type) {
      case "cosmos":
        return await getCosmosLedgerSigner(config)
    }
  } else if (signingType === `extension`) {
    return signMessage => {
      return signWithExtension(
        signMessage,
        address,
        network,
        transactionData,
        displayedProperties
      )
    }
  }

  throw new Error(
    `Lunie doesn't support signing via ${signingType} for network type ${network.network_type}`
  )
}

async function getCosmosLocalSigner(wallet) {
  const { signWithPrivateKey } = await import("@lunie/cosmos-keys")

  return signMessage => {
    const signature = signWithPrivateKey(
      signMessage,
      Buffer.from(wallet.privateKey, "hex")
    )

    return {
      signature,
      publicKey: Buffer.from(wallet.publicKey, "hex")
    }
  }
}

async function getPolkadotLocalSigner(wallet) {
  const { getSignedMessage } = await import("./polkadot-signing")

  return signMessage => {
    const signedMessage = getSignedMessage(signMessage, wallet.seedPhrase)

    return signedMessage
  }
}

async function getCosmosLedgerSigner(config) {
  // TODO show which properties of config are actually needed
  // importing default here to be compatible with Jest
  const { default: Ledger } = await import("@lunie/cosmos-ledger")

  return async signMessage => {
    const ledger = new Ledger(config)
    let publicKey, signature
    try {
      publicKey = await ledger.getPubKey()
      signature = await ledger.sign(signMessage)
    } catch (err) {
      /* istanbul ignore next: specific error rewrite */
      if (err.message.trim().startsWith("Device is already open")) {
        throw new Error(
          "Something went wrong connecting to your Ledger. Please refresh your page and try again."
        )
      }
      throw err
    }

    // cleanup. if we leave this open, the next connection will break for HID
    ledger.cosmosApp.transport.close()

    return {
      signature,
      publicKey
    }
  }
}
