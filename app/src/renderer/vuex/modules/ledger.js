import * as Sentry from "@sentry/browser"
import { App, comm_u2f } from "ledger-cosmos-js"
import { createCosmosAddress } from "../../scripts/wallet.js"

// TODO: discuss TIMEOUT value
const TIMEOUT = 50 // seconds to wait for user action on Ledger
const HDPATH = [44, 118, 0, 0, 0]

export default () => {
  const emptyState = {
    error: null,
    app: null, // Cosmos ledger app instance
    isConnected: false,
    pubKey: null, // 33 bytes; used for broadcasting signed txs
    uncompressedPubKey: null, // 65 bytes; not used currently
    version: null // Cosmos app version
  }
  const state = {
    ...emptyState,
    externals: { createCosmosAddress, App, comm_u2f } // for testing
  }
  const mutations = {
    setLedger(state, app) {
      state.app = app
    },
    setLedgerCosmosVersion(state, version) {
      state.version = version
    },
    setLedgerPubKey(state, pubKey) {
      state.pubKey = pubKey
    },
    setLedgerUncompressedPubKey(state, uncompressedPubKey) {
      state.uncompressedPubKey = uncompressedPubKey
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
    /* TODO: Create a function to detect ledger is connected (i.e unlocked with
      password and on Home app) */
    async connectLedgerApp({ commit, dispatch, state }) {
      try {
        const comm = await state.externals.comm_u2f.create_async(TIMEOUT, true)
        const app = new state.externals.App(comm)
        commit(`setLedger`, app)
        await dispatch(`getLedgerCosmosVersion`)
        commit(`setLedgerConnection`, true)
        await dispatch(`getLedgerPubKey`)
        const address = state.externals.createCosmosAddress(state.pubKey)
        await dispatch(`signIn`, { sessionType: `ledger`, address })
      } catch (error) {
        commit(`notifyError`, {
          title: `Error connecting to Ledger`,
          body: error.message
        })
        Sentry.captureException(error)
        commit(`setLedgerError`, error.message)
      } finally {
        return !state.error
      }
    },
    async getLedgerCosmosVersion({ commit, dispatch, state }) {
      let response = await state.app.get_version()
      const title = `Error retrieving Cosmos Ledger app version`
      response = await dispatch(`checkLedgerErrors`, { response, title })
      if (response && response.major && response.minor && response.patch) {
        const { major, minor, patch, test_mode } = response
        const version = { major, minor, patch, test_mode }
        commit(`setLedgerCosmosVersion`, version)
      }
    },
    async getLedgerPubKey({ commit, dispatch, state }) {
      let response = await state.app.publicKey(HDPATH)
      const title = `Error getting pubKey from Ledger`
      response = await dispatch(`checkLedgerErrors`, { response, title })
      if (response && response.compressed_pk && response.pk) {
        commit(`setLedgerPubKey`, response.compressed_pk)
        commit(`setLedgerUncompressedPubKey`, response.pk)
      }
    },
    async signWithLedger({ dispatch, state }, message) {
      let response = await state.app.sign(HDPATH, message)
      const title = `Signing transaction with Ledger failed`
      response = await dispatch(`checkLedgerErrors`, { response, title })
      if (response && response.signature) {
        return response.signature
      }
      return undefined
    },
    async checkLedgerErrors({ commit }, { response, title }) {
      if (response && response.error_message !== `No errors`) {
        commit(`notifyError`, {
          title,
          body: response.error_message
        })
        Sentry.captureException(response.error_message)
        commit(`setLedgerError`, response.error_message)
        return false
      }
      return response
    }
  }
  return {
    state,
    mutations,
    actions
  }
}
