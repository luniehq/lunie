import { Keyring } from "@polkadot/api"
import { hexToU8a } from "@polkadot/util"

export async function getSignature({ payload, transaction }, wallet) {
  const keyring = new Keyring()
  const keypair = keyring.createFromUri(wallet.seedPhrase)

  const rawSignature = keypair.sign(hexToU8a(payload.toRaw().data))

  return { payload, transaction, rawSignature }
}
