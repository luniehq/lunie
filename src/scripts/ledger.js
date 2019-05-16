import { App, comm_u2f } from "ledger-cosmos-js"
import { createCosmosAddress } from "scripts/wallet.js"
import { signatureImport } from "secp256k1"
import semver from "semver"

// TODO: discuss TIMEOUT value
const INTERACTION_TIMEOUT = 120 // seconds to wait for user action on Ledger, currently is always limited to 60
const REQUIRED_COSMOS_APP_VERSION = "1.5.0"
//const REQUIRED_LEDGER_FIRMWARE = "1.1.1"

/*
HD wallet derivation path (BIP44)
DerivationPath{44, 118, account, 0, index}
*/
const HDPATH = [44, 118, 0, 0, 0]
const BECH32PREFIX = `cosmos`

export default class Ledger {
  constructor({ testModeAllowed }) {
    this.testModeAllowed = testModeAllowed
  }

  // test connection and compatibility
  async testDevice() {
    // poll device with low timeout to check if the device is connected
    const secondsTimeout = 3 // a lower value always timeouts
    await this.connect(secondsTimeout)
  }
  async isSendingData() {
    // check if the device is connected or on screensaver mode
    const response = await this.cosmosApp.publicKey(HDPATH)
    this.checkLedgerErrors(response, {
      timeoutMessag: "Could not find a connected and unlocked Ledger device"
    })
  }
  async isReady() {
    // check if the version is supported
    const version = await this.getCosmosAppVersion()

    if (!semver.gte(version, REQUIRED_COSMOS_APP_VERSION)) {
      const msg = `Outdated version: Please update Ledger Cosmos App to the latest version.`
      throw new Error(msg)
    }

    // throws if not open
    await this.isCosmosAppOpen()
  }
  // connects to the device and checks for compatibility
  async connect(timeout = INTERACTION_TIMEOUT) {
    // assume well connection if connected once
    if (this.cosmosApp) return

    const communicationMethod = await comm_u2f.create_async(timeout, true)
    const cosmosLedgerApp = new App(communicationMethod)

    this.cosmosApp = cosmosLedgerApp

    await this.isSendingData()
    await this.isReady()
  }
  async getCosmosAppVersion() {
    await this.connect()

    const response = await this.cosmosApp.get_version()
    this.checkLedgerErrors(response)
    const { major, minor, patch, test_mode } = response
    checkAppMode(this.testModeAllowed, test_mode)
    const version = versionString({ major, minor, patch })

    return version
  }
  async isCosmosAppOpen() {
    await this.connect()

    const response = await this.cosmosApp.appInfo()
    this.checkLedgerErrors(response)
    const { appName } = response

    if (appName.toLowerCase() !== `cosmos`) {
      throw new Error(`Close ${appName} and open the Cosmos app`)
    }
  }
  async getPubKey() {
    await this.connect()

    const response = await this.cosmosApp.publicKey(HDPATH)
    this.checkLedgerErrors(response)
    return response.compressed_pk
  }
  async getCosmosAddress() {
    await this.connect()

    const pubKey = await this.getPubKey(this.cosmosApp)
    return createCosmosAddress(pubKey)
  }
  async confirmLedgerAddress() {
    await this.connect()
    const cosmosAppVersion = await this.getCosmosAppVersion()

    if (semver.lt(cosmosAppVersion, REQUIRED_COSMOS_APP_VERSION)) {
      // we can't check the address on an old cosmos app
      return
    }

    const response = await this.cosmosApp.getAddressAndPubKey(
      BECH32PREFIX,
      HDPATH
    )
    this.checkLedgerErrors(response, {
      rejectionMessage: "Displayed address was rejected"
    })
  }
  async sign(signMessage) {
    await this.connect()

    const response = await this.cosmosApp.sign(HDPATH, signMessage)
    this.checkLedgerErrors(response)
    // we have to parse the signature from Ledger as it's in DER format
    const parsedSignature = signatureImport(response.signature)
    return parsedSignature
  }

  /* istanbul ignore next: maps a bunch of errors */
  checkLedgerErrors(
    { error_message, device_locked },
    {
      timeoutMessag = "Connection timed out. Please try again.",
      rejectionMessage = "User rejected the transaction"
    } = {}
  ) {
    if (device_locked) {
      throw new Error(`Ledger's screensaver mode is on`)
    }
    switch (error_message) {
      case `U2F: Timeout`:
        throw new Error(timeoutMessag)
      case `Cosmos app does not seem to be open`:
        throw new Error(`Cosmos app is not open`)
      case `Command not allowed`:
        throw new Error(`Transaction rejected`)
      case `Transaction rejected`:
        throw new Error(rejectionMessage)
      case `Unknown error code`:
        throw new Error(`Ledger's screensaver mode is on`)
      case `Instruction not supported`:
        throw new Error(
          `Your Cosmos Ledger App is not up to date. ` +
          `Please update to version ${REQUIRED_COSMOS_APP_VERSION}.`
        )
      case `No errors`:
        // do nothing
        break
      default:
        throw new Error(error_message)
    }
  }
}

function versionString({ major, minor, patch }) {
  return `${major}.${minor}.${patch}`
}

export const checkAppMode = (testModeAllowed, testMode) => {
  if (testMode && !testModeAllowed) {
    throw new Error(
      `DANGER: The Cosmos Ledger app is in test mode and shouldn't be used on mainnet!`
    )
  }
}
