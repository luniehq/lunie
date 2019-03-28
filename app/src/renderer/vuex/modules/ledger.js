import * as Sentry from "@sentry/browser"
import { App, comm_u2f } from "ledger-cosmos-js"

// TODO: discuss TIMEOUT value
const TIMEOUT = 50 // seconds to wait for user action on Ledger

/*
HD wallet derivation path (BIP44)
DerivationPath{44, 118, account, 0, index}
*/
// TODO: change when HD wallet is supported on UI
const HDPATH = [44, 118, 0, 0, 0]
const BECH32PREFIX = `cosmos`

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
    externals: { App, comm_u2f } // for testing
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
    },
    setLedgerError(state, error) {
      state.error = error
    }
  }

  const actions = {
    resetSessionData({ rootState }) {
      rootState.ledger = {
        ...JSON.parse(JSON.stringify(emptyState)),
        externals: state.externals
      }
    },
    async pollLedgerDevice({ state }) {
      // poll device with low timeout to check if the device is connected
      const secondsTimeout = 3 // a lower value always timeouts
      const communicationMethod = await state.externals.comm_u2f.create_async(
        secondsTimeout,
        true
      )
      const cosmosLedgerApp = new state.externals.App(communicationMethod)

      // check if the device is connected or on screensaver mode
      const response = await cosmosLedgerApp.appInfo()
      actions.checkLedgerErrors(response)
      const { appName, appVersion } = response
      if (appName === `Cosmos` && appVersion !== `1.3.1`) {
        throw new Error(`Outdated version: please update Cosmos app v1.3.1`)
      } else if (appName !== `Cosmos`) {
        throw new Error(`Close ${appName} and open the Cosmos app`)
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
      try {
        await dispatch(`pollLedgerDevice`)
        await dispatch(`createLedgerAppInstance`)
        await dispatch(`getLedgerCosmosVersion`)
        await dispatch(`getLedgerAddressAndPubKey`)
        commit(`setLedgerConnection`, true)
      } catch (error) {
        Sentry.captureException(error)
        commit(`setLedgerError`, error)
        throw error
      }
    },
    async getLedgerCosmosVersion({ commit, state, rootState }) {
      const response = await state.cosmosApp.get_version()
      actions.checkLedgerErrors(response)
      actions.checkAppMode(response, rootState)
      const { major, minor, patch, test_mode } = response
      const version = { major, minor, patch, test_mode }
      commit(`setCosmosAppVersion`, version)
    },
    async getLedgerAddressAndPubKey({ commit, dispatch, state }) {
      const response = await state.cosmosApp
        .getAddressAndPubKey(BECH32PREFIX, HDPATH)
      actions.checkLedgerErrors(response)
      const { bech32_address, compressed_pk } = response
      commit(`setLedgerPubKey`, compressed_pk)
      await dispatch(`signIn`,
        { sessionType: `ledger`, address: bech32_address }
      )
    },
    async showAddressOnLedger({ commit }) {
      try {
        const response = await state.cosmosApp.showAddress(BECH32PREFIX, HDPATH)
        actions.checkLedgerErrors(response)
      } catch (error) {
        Sentry.captureException(error)
        commit(`setLedgerError`, error)
      }
    },
    async signWithLedger({ commit, state }, message) {
      try {
        const response = await state.cosmosApp.sign(HDPATH, message)
        actions.checkLedgerErrors(response)
        return response.signature
      } catch (error) {
        Sentry.captureException(error)
        commit(`setLedgerError`, error)
        throw error
      }
    },
    checkLedgerErrors({ error_message }) {
      switch (error_message) {
        case `U2F: Timeout`:
          throw new Error(`No Ledger found`)
        case `Cosmos app does not seem to be open`:
          throw new Error(`Cosmos app is not open`)
        case `Command not allowed`:
          throw new Error(`Transaction rejected`)
        case `Unknown error code`:
          throw new Error(`Ledger's screensaver mode is on`)
        case `No errors`:
          // do nothing
          break
        default:
          throw new Error(error_message)
      }
    },
    checkAppMode({ device_locked, test_mode }, rootState) {
      if (device_locked) {
        throw new Error(`Ledger's screensaver mode is on`)
      } else if (
        test_mode &&
        rootState &&
        rootState.connection &&
        rootState.connection.lastHeader &&
        rootState.connection.lastHeader.chain_id.startsWith(`cosmoshub`)
      ) {
        throw new Error(`WARNING: Cosmos app on test mode shouldn't be used on mainnet!`)
      }
    }
  }
  return {
    state,
    mutations,
    actions
  }
}
