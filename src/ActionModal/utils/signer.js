import Ledger from "@lunie/cosmos-ledger"
import { getKey } from "scripts/keystore"
import { signWithPrivateKey } from "@lunie/cosmos-keys"

export function getSigner(
  config,
  submitType = "",
  { localKeyPairName, password, senderAddress }
) {
  if (submitType === `extension`) {
    return signMessage => {
      console.log("REQUEST")
      window.postMessage(
        {
          type: "LUNIE_SIGN_REQUEST",
          payload: {
            signMessage,
            senderAddress
          }
        },
        "*"
      )

      return new Promise((resolve, reject) => {
        window.addEventListener("LUNIE_SIGN_REQUEST_ANSWER", function({
          signature,
          publicKey,
          denied
        }) {
          if (denied) {
            reject()
            return
          }
          resolve({
            signature: Buffer.from(signature, "hex"),
            publicKey: Buffer.from(publicKey, "hex")
          })
        })
      })
    }
  } else if (submitType === `local`) {
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
