import { signWithExtension } from "src/scripts/extension-utils"

export async function getSigner(
  config,
  submitType = "",
  { address, password }
) {
  if (submitType === `local`) {
    const { signWithPrivateKey, getStoredWallet } = await import(
      "@lunie/cosmos-keys"
    )

    const wallet = getStoredWallet(address, password)
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
  } else if (submitType === `ledger`) {
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

      // cleanup. if we leave this open, the next connection will brake for HID
      ledger.cosmosApp.transport.close()

      return {
        signature,
        publicKey
      }
    }
  } else if (submitType === `extension`) {
    return signMessage => {
      return signWithExtension(signMessage, address)
    }
  }
}
