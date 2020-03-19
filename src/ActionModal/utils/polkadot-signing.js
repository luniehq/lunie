import { Keyring } from "@polkadot/api"
import { hexToU8a, u8aToHex, u8aConcat } from "@polkadot/util"

// just for completeness in here
const curvePrefixes = {
  ed25519: [0],
  sr25519: [1]
}

function getSignature(rawSignature) {
  const prefix = new Uint8Array(curvePrefixes["ed25519"])
  const signature = u8aToHex(u8aConcat(prefix, rawSignature))
  return signature
}

export function getSignedMessage({ payload, transaction }, seed) {
  const keyring = new Keyring()
  const keypair = keyring.createFromUri(seed)

  const rawSignature = keypair.sign(hexToU8a(payload.toRaw().data))
  const signature = getSignature(rawSignature)

  transaction.addSignature(
    payload.address.toJSON(),
    signature,
    payload.toPayload()
  )

  const signedMessage = transaction.toJSON()
  return signedMessage
}
