import { App, comm_u2f } from "ledger-cosmos-js"
import { createCosmosAddress } from "scripts/wallet.js"
import config from "src/config"
import semver from "semver"

// TODO: discuss TIMEOUT value
const TIMEOUT = 60 // seconds to wait for user action on Ledger

/*
HD wallet derivation path (BIP44)
DerivationPath{44, 118, account, 0, index}
*/
// TODO: add this to state when HD wallet is supported on UI
const HDPATH = [44, 118, 0, 0, 0]
const BECH32PREFIX = `cosmos`

function versionString({ major, minor, patch }) {
  return `${major}.${minor}.${patch}`
}

export const checkLedgerErrors = (
  state,
  { error_message, device_locked },
  {
    timeoutMessag = "Connection timed out. Please try again.",
    rejectionMessage = "User rejected the transaction"
  } = {}
) => {
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
          `Please update to version ${
            state.externals.config.requiredCosmosAppVersion
          }.`
      )
    case `No errors`:
      // do nothing
      break
    default:
      throw new Error(error_message)
  }
}

const checkAppMode = (chainId, response) => {
  const { test_mode } = response

  if (test_mode && chainId.startsWith(`cosmoshub`)) {
    throw new Error(
      `DANGER: The Cosmos Ledger app is in test mode and shouldn't be used on mainnet!`
    )
  }
}

export default () => {
  const emptyState = {
    error: null,
    cosmosApp: null,
    isConnected: false,
    pubKey: null, // 33 bytes; used for broadcasting signed txs and getting the address
    cosmosAppVersion: null
  }
  const state = {
    ...emptyState,
    externals: { App, comm_u2f, createCosmosAddress, config } // for testing
  }
  const mutations = {
    setCosmosApp(state, app) {
      state.cosmosApp = app
    },
    setCosmosAppVersion(state, version) {
      state.cosmosAppVersion = version
    },
    setLedgerPubKey(state, pubKey) {
      state.pubKey = pubKey
    },
    setLedgerConnection(state, isConnected) {
      state.isConnected = isConnected
    }
  }

  const actions = {
    resetSessionData({ rootState }) {
      rootState.ledger = {
        ...JSON.parse(JSON.stringify(emptyState)),
        externals: state.externals
      }
    },
    async pollLedgerDevice({ dispatch, commit, state }) {
      // poll device with low timeout to check if the device is connected
      const secondsTimeout = 5 // a lower value always timeouts
      const communicationMethod = await state.externals.comm_u2f.create_async(
        secondsTimeout,
        true
      )
      const cosmosLedgerApp = new state.externals.App(communicationMethod)

      // check if ledger is connected
      const response = await cosmosLedgerApp.publicKey(HDPATH)
      checkLedgerErrors(state, response, {
        timeoutMessag: "Could not find a connected and unlocked Ledger device"
      })

      // check if the version is supported
      const version = await dispatch(`getLedgerCosmosVersion`, cosmosLedgerApp)

      // check if the device is connected or on screensaver mode
      if (semver.satisfies(version, ">=1.5.0")) {
        // throws if not open
        await dispatch(`getOpenAppInfo`, cosmosLedgerApp)
      } else {
        // DEPRECATION disable and turn into a block to use ledger around end of may
        commit("notifyWarn", {
          title: "Ledger Cosmos App Outdated",
          body:
            "Your Ledger Cosmos App version is going to be deprecated. Please update to the lastest app version using Ledger Live."
        })
      }
    },
    async createLedgerAppInstance({ commit, state }) {
      const communicationMethod = await state.externals.comm_u2f.create_async(
        TIMEOUT,
        true
      )
      const cosmosLedgerApp = new state.externals.App(communicationMethod)
      commit(`setCosmosApp`, cosmosLedgerApp)
    },
    async connectLedgerApp({ commit, dispatch }) {
      await dispatch(`pollLedgerDevice`)
      await dispatch(`createLedgerAppInstance`)
      const address = await dispatch(`getLedgerAddressAndPubKey`)
      commit(`setLedgerConnection`, true)

      return address
    },
    async getOpenAppInfo({ state }, app) {
      const response = await app.appInfo()
      checkLedgerErrors(state, response)
      const { appName } = response

      if (appName !== `Cosmos`) {
        throw new Error(`Close ${appName} and open the Cosmos app`)
      }
    },
    async getLedgerCosmosVersion(
      {
        state,
        rootState: {
          connection: {
            lastHeader: { chain_id }
          }
        },
        commit
      },
      app = state.cosmosApp
    ) {
      const response = await app.get_version()
      checkLedgerErrors(state, response)
      const { major, minor, patch } = response
      checkAppMode(chain_id, response)
      const version = versionString({ major, minor, patch })
      commit(`setCosmosAppVersion`, version)

      if (
        !semver.gte(version, state.externals.config.requiredCosmosAppVersion)
      ) {
        const msg = `Outdated version: please update Cosmos app to ${
          state.externals.config.requiredCosmosAppVersion
        }`
        throw new Error(msg)
      }

      return version
    },
    async getLedgerAddressAndPubKey({ commit, state }) {
      const response = await state.cosmosApp.publicKey(HDPATH)
      checkLedgerErrors(state, response)
      const { bech32_address, compressed_pk } = response
      const address =
        bech32_address || state.externals.createCosmosAddress(compressed_pk)
      commit(`setLedgerPubKey`, compressed_pk)
      return address
    },
    async confirmLedgerAddress({ state }) {
      if (semver.lt(state.cosmosAppVersion, "1.5.0")) {
        // we can't check the address on an old cosmos app
        return true
      }

      const response = await state.cosmosApp.getAddressAndPubKey(
        BECH32PREFIX,
        HDPATH
      )
      checkLedgerErrors(state, response, {
        rejectionMessage: "Displayed address was rejected"
      })
    },
    async signWithLedger({ state }, message) {
      const response = await state.cosmosApp.sign(HDPATH, message)
      checkLedgerErrors(state, response)
      return response.signature
    }
  }
  return {
    state,
    mutations,
    actions
  }
}
