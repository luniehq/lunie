export async function getSignature({ transaction }, wallet, network, curve) {
  const [{ Keyring }] = await Promise.all([
    import("@polkadot/api"),
    import("@polkadot/wasm-crypto").then(async ({ waitReady }) => {
      await waitReady()
    }),
    import("@polkadot/util-crypto").then(async ({ cryptoWaitReady }) => {
      // Wait for the promise to resolve, async WASM or `cryptoWaitReady().then(() => { ... })`
      await cryptoWaitReady()
    }),
  ])

  const keyring = new Keyring({
    ss58Format: Number(network.address_prefix),
    type: curve || network.defaultCurve,
  })
  const keypair = keyring.createFromUri(wallet.seedPhrase)
  const signedMessage = (await transaction.signAsync(keypair)).toJSON()

  return { signedMessage }
}
