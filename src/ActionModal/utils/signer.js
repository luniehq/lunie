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
    // immporting default here to be comptabile with Jest
    const { default: Ledger } = await import("@lunie/cosmos-ledger")

    return async signMessage => {
      const ledger = new Ledger(config)
      const publicKey = await ledger.getPubKey()
      const signature = await ledger.sign(signMessage)

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
