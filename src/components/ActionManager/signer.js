import Ledger from "scripts/ledger"
import { getKey } from "scripts/keystore"
import { signWithPrivateKey } from "scripts/wallet"

export function getSigner(
  config,
  submitType = "",
  { localKeyPairName, password }
) {
  if (submitType === `local`) {
    return signMessage => {
      const wallet = getKey(localKeyPairName, password)
      const signature = signWithPrivateKey(signMessage, wallet.privateKey)

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
