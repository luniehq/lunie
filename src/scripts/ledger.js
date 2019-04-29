import { App, comm_u2f } from "ledger-cosmos-js"
import { createCosmosAddress } from "scripts/wallet.js"
import { signatureImport } from "secp256k1"

// TODO: discuss TIMEOUT value
const INTERACTION_TIMEOUT = 120 // seconds to wait for user action on Ledger

/*
HD wallet derivation path (BIP44)
DerivationPath{44, 118, account, 0, index}
*/
const HDPATH = [44, 118, 0, 0, 0]

export default class Ledger {
  constructor() {}

  async testLedgerDevice() {
    // poll device with low timeout to check if the device is connected
    const secondsTimeout = 3 // a lower value always timeouts
    this.connect(secondsTimeout)

    // check if the device is connected or on screensaver mode
    const response = await this.cosmosApp.publicKey(HDPATH)

    switch (response.error_message) {
      case `U2F: Timeout`:
        throw new Error(`No Ledger found`)
      case `Cosmos app does not seem to be open`:
        throw new Error(`Cosmos app is not open on the Ledger`)
      case `Unknown error code`: // TODO: create error for screensaver mode
        throw new Error(`Ledger's screensaver mode is on`)
      case `No errors`:
        // do nothing
        break
      default:
        throw new Error(response.error_message)
    }

    this.cosmosApp = null
  }
  async connect(timeout = INTERACTION_TIMEOUT) {
    // do not reconnect if already connected
    if (this.cosmosApp) return this

    await this.testLedgerDevice()

    const communicationMethod = await comm_u2f.create_async(timeout, true)
    const cosmosLedgerApp = new App(communicationMethod)

    this.cosmosApp = cosmosLedgerApp

    return this
  }
  async getCosmosAppVersion() {
    this.connect()

    const response = await this.cosmosApp.get_version()
    checkLedgerErrors(response)
    const { major, minor, patch, test_mode } = response
    return { major, minor, patch, test_mode }
  }
  async getPubKey() {
    this.connect()

    const response = await this.cosmosApp.publicKey(HDPATH)
    checkLedgerErrors(response)
    return response.compressed_pk
  }
  async getCosmosAddress() {
    this.connect()

    const pubKey = await this.getPubKey(this.cosmosApp)
    return createCosmosAddress(pubKey)
  }
  async sign(signMessage) {
    this.connect()

    const response = await this.cosmosApp.sign(HDPATH, signMessage)
    checkLedgerErrors(response)
    // we have to parse the signature from Ledger as it's in DER format
    const parsedSignature = signatureImport(response.signature)
    return parsedSignature
  }
}

function checkLedgerErrors(response) {
  if (response && response.error_message === `Command not allowed`) {
    throw new Error(`Transaction rejected`)
  } else if (response && response.error_message !== `No errors`) {
    throw new Error(response.error_message)
  }
}
