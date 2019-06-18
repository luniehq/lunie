import Ledger from "@lunie/cosmos-ledger"
import { getKey } from "scripts/keystore"
import { signWithPrivateKey } from "@lunie/cosmos-keys"

export function getSigner(
  config,
  submitType = "",
  { localKeyPairName, password }
) {
  if (submitType === `local`) {
    const wallet = getKey(localKeyPairName, password)
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
  } else {
    return async signMessage => {
      const ledger = new Ledger(config)
      const publicKey = await ledger.getPubKey()
      const signature = await ledger.sign(signMessage)

      return {
        signature,
        publicKey
      }
    }
  }
}
