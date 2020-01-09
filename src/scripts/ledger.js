import config from "src/../config"

export const getAddressFromLedger = async network => {
  const ledger = await getLedgerConnector(network)

  let address
  try {
    address = await ledger.getCosmosAddress() // TODO this should become `getAddress` to also work for not Cosmos networks
  } catch (err) {
    // TODO move this error rewrite into the ledger lib
    /* istanbul ignore next: specific error rewrite */
    if (err.message.trim().startsWith("Device is already open")) {
      throw new Error(
        "Something went wrong connecting to your Ledger. Please refresh your page and try again."
      )
    }
    throw err
  }

  // cleanup. if we leave this open, the next connection will brake for HID
  // TODO move this into the leder lib
  ledger.cosmosApp.transport.close()

  return address
}

export async function showAddressOnLedger(network) {
  const ledger = await getLedgerConnector(network)

  try {
    await ledger.confirmLedgerAddress()
  } catch (err) {
    // TODO move this error rewrite into the ledger lib
    /* istanbul ignore next: specific error rewrite */
    if (err.message.trim().startsWith("Device is already open")) {
      throw new Error(
        "Something went wrong connecting to your Ledger. Please refresh your page and try again."
      )
    }
    throw err
  }

  // cleanup. if we leave this open, the next connection will brake for HID
  // TODO move this into the leder lib
  ledger.cosmosApp.transport.close()
}

async function getLedgerConnector(network) {
  switch (network) {
    case "cosmos-hub-mainnet":
    case "cosmos-hub-testnet":
    case "regen-testnet":
    case "regen-mainnet":
    case "terra-testnet":
    case "terra-mainnet": {
      const { default: Ledger } = await import("@lunie/cosmos-ledger")

      const HDPATH = [44, 118, 0, 0, 0]
      const ledger = new Ledger(
        {
          testModeAllowed: config.testModeAllowed
        },
        HDPATH,
        config.bech32Prefixes[network]
      )

      return ledger
    }
    default:
      throw new Error(
        "Lunie doesn't support connecting to the Ledger for this network."
      )
  }
}
