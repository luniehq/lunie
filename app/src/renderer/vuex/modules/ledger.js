import * as Sentry from "@sentry/browser"
import { App, comm_u2f } from "ledger-cosmos-js"
import { createCosmosAddress } from "../../scripts/wallet.js"

// TODO: discuss TIMEOUT value
const TIMEOUT = 50 // seconds to wait for user action on Ledger

/*
HD wallet derivation path (BIP44)
DerivationPath{44, 118, account, 0, index}
*/
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
    externals: { createCosmosAddress, App, comm_u2f } // for testing
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
      const secondsTimeout = 5 // a lower value always timeouts
      const communicationMethod = await state.externals.comm_u2f.create_async(
        secondsTimeout,
        true
      )
      const cosmosLedgerApp = new state.externals.App(communicationMethod)

      // check if the device is connected or on screensaver mode
      const response = await cosmosLedgerApp.appInfo()
      const { error_message, appName, appVersion } = response
      console.log(response)

      switch (error_message) {
        case `U2F: Timeout`:
          throw new Error(`No Ledger found`)
        case `Cosmos app does not seem to be open`:
          throw new Error(`Cosmos app is not open`)
        case `No errors`:
          // do nothing
          break
        default:
          throw new Error(response.error_message)
      }

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
    async getLedgerCosmosVersion({ commit, state }) {
      let response
      try {
        response = await state.cosmosApp.get_version()
        console.log(response)
        actions.checkLedgerErrors(response)
        const { major, minor, patch, test_mode } = response
        const version = { major, minor, patch, test_mode }
        commit(`setCosmosAppVersion`, version)
      } catch (error) {
        Sentry.captureException(error)
        commit(`setLedgerError`, error)
      }
    },
    async getLedgerAddressAndPubKey({ commit, dispatch, state }) {
      let response
      try {
        response = await state.cosmosApp
          .getAddressAndPubKey(BECH32PREFIX, HDPATH)
        console.log(response)

        actions.checkLedgerErrors(response)
        const { bech32_address, compressed_pk } = response
        commit(`setLedgerPubKey`, compressed_pk)
        await dispatch(`signIn`,
          { sessionType: `ledger`, address: bech32_address }
        )
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
    checkLedgerErrors({ rootState }, response) {
      if (response && response.error_message === `Command not allowed`) {
        throw new Error(`Transaction rejected`)
      } else if (response && response.error_message !== `No errors`) {
        throw new Error(response.error_message)
      }
      if (response && response.device_locked) {
        throw new Error(`Ledger's screensaver mode is on`)
      }
      if (
        response &&
        response.test_mode &&
        rootState.connection &&
        rootState.connection.lastHeader &&
        rootState.connection.lastHeader.chain_id.startsWith(`cosmoshub`)
      ) {
        throw new Error(`WARNING: Ledger apps on test mode shouldn't be used on mainnet!`)
      }
    }
  }
  return {
    state,
    mutations,
    actions
  }
}
