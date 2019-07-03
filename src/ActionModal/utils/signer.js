import Ledger from "@lunie/cosmos-ledger"
import { signWithPrivateKey, getStoredWallet } from "@lunie/cosmos-keys"
import { signWithExtension } from "src/scripts/extension-utils"

export function getSigner(config, submitType = "", { address, password }) {
  if (submitType === `local`) {
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
