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
      const secondsTimeout = 3 // a lower value always timeouts
      const communicationMethod = await state.externals.comm_u2f.create_async(
        secondsTimeout,
        true
      )
      const cosmosLedgerApp = new state.externals.App(communicationMethod)

      // check if the device is connected or on screensaver mode
      const response = await cosmosLedgerApp.publicKey(HDPATH)

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
    },
    async createLedgerAppInstance({ commit, state }) {
      const communicationMethod = await state.externals.comm_u2f.create_async(
        TIMEOUT,
        true
      )
      const cosmosLedgerApp = new state.externals.App(communicationMethod)
      commit(`setCosmosApp`, cosmosLedgerApp)
    },
    async connectLedgerApp({ commit, dispatch, state }) {
      try {
        await dispatch(`pollLedgerDevice`)
        await dispatch(`createLedgerAppInstance`)
        await dispatch(`getLedgerCosmosVersion`)
        await dispatch(`getLedgerPubKey`)
        const address = state.externals.createCosmosAddress(state.pubKey)
        await dispatch(`signIn`, { sessionType: `ledger`, address })
        commit(`setLedgerConnection`, true)
      } catch (error) {
        Sentry.captureException(error)
        commit(`setLedgerError`, error)
        throw error
      }
    },
    async getLedgerCosmosVersion({ commit, state }) {
      const response = await state.cosmosApp.get_version()
      actions.checkLedgerErrors(response)
      const { major, minor, patch, test_mode } = response
      const version = { major, minor, patch, test_mode }
      commit(`setCosmosAppVersion`, version)
      if (minor === 0 && patch === 0) {
        throw new Error(`Comos Ledger App is outdated. Please update to at least version 1.0.1`)
      }
    },
    async getLedgerPubKey({ commit, state }) {
      let response
      try {
        response = await state.cosmosApp.publicKey(HDPATH)
        actions.checkLedgerErrors(response)
        commit(`setLedgerPubKey`, response.compressed_pk)
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
    checkLedgerErrors(response) {
      if (response && response.error_message === `Command not allowed`) {
        throw new Error(`Transaction rejected`)
      } else if (response && response.error_message !== `No errors`) {
        throw new Error(response.error_message)
      }
    }
  }
  return {
    state,
    mutations,
    actions
  }
}
