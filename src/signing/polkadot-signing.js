import { Keyring } from "@polkadot/api"
import { hexToU8a, u8aToHex, u8aConcat } from "@polkadot/util"

// just for completeness in here
const curvePrefixes = {
  ed25519: [0],
  sr25519: [1]
}

function formatSignature(rawSignature) {
  const prefix = new Uint8Array(curvePrefixes["ed25519"])
  const signature = u8aToHex(u8aConcat(prefix, rawSignature))
  return signature
}

export function getSignableObject(message) {
  return message // is already a signable object
}

export async function getSignature({ payload, transaction }, wallet) {
  const keyring = new Keyring()
  const keypair = keyring.createFromUri(wallet.seedPhrase)

  const rawSignature = keypair.sign(hexToU8a(payload.toRaw().data))

  return { payload, transaction, rawSignature }
}

export function getBroadcastableObject(
  _,
  y,
  { transaction, payload, rawSignature }
) {
  const signature = formatSignature(rawSignature)

  transaction.addSignature(
    payload.address.toJSON(),
    signature,
    payload.toPayload()
  )

  const signedMessage = transaction.toJSON()
  return signedMessage
}
