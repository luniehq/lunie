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
      // poke with low timeout to check if the device is connected
      const secondsTimeout = 2 // with less than 2 secs it always timeouts
      const communicationMethod = await state.externals.comm_u2f.create_async(
        secondsTimeout,
        true
      )
      const cosmosLedgerApp = new state.externals.App(communicationMethod)
      const response = await cosmosLedgerApp.get_version()

      switch (response.error_message) {
        case `U2F: Timeout`:
          return `No Ledger found`
        case `Cosmos app does not seem to be open`:
          return `Cøsmos app is not open`
        default:
          return ``
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
      let connectionMessage
      try {
        connectionMessage = await dispatch(`pollLedgerDevice`)
        console.log(connectionMessage)
        if (!connectionMessage) {
          await dispatch(`createLedgerAppInstance`)
          await dispatch(`getLedgerCosmosVersion`)
          await dispatch(`getLedgerPubKey`)
          const address = state.externals.createCosmosAddress(state.pubKey)
          await dispatch(`signIn`, { sessionType: `ledger`, address })
          commit(`setLedgerConnection`, true)
        }
      } catch (error) {
        commit(`notifyError`, {
          title: `Error connecting to Ledger Nano S`,
          body: error.message
        })
        Sentry.captureException(error)
        commit(`setLedgerError`, error)
      } finally {
        return connectionMessage
      }
    },
    async getLedgerCosmosVersion({ commit, state }) {
      let response
      try {
        response = await state.cosmosApp.get_version()
        actions.checkLedgerErrors(response)
        const { major, minor, patch, test_mode } = response
        const version = { major, minor, patch, test_mode }
        commit(`setCosmosAppVersion`, version)
      } catch (error) {
        commit(`notifyError`, {
          title: `Error retrieving Cosmos Ledger app version`,
          body: error.message
        })
        Sentry.captureException(error)
        commit(`setLedgerError`, error)
      }
    },
    async getLedgerPubKey({ commit, state }) {
      let response
      try {
        response = await state.cosmosApp.publicKey(HDPATH)
        actions.checkLedgerErrors(response)
        commit(`setLedgerPubKey`, response.compressed_pk)
      } catch (error) {
        commit(`notifyError`, {
          title: `Error getting public key from Ledger`,
          body: error.message
        })
        Sentry.captureException(error)
        commit(`setLedgerError`, error)
      }
    },
    async signWithLedger({ commit, state }, message) {
      let signature
      try {
        const response = await state.cosmosApp.sign(HDPATH, message)
        actions.checkLedgerErrors(response)
        signature = response.signature
      } catch (error) {
        commit(`notifyError`, {
          title: `Signing transaction with Ledger failed`,
          body: error.message
        })
        Sentry.captureException(error)
        commit(`setLedgerError`, error)
      } finally {
        return signature
      }
    },
    checkLedgerErrors(response) {
      if (response && response.error_message !== `No errors`) {
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
