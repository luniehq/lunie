import * as Sentry from "@sentry/browser"
import { App, comm_u2f } from "ledger-cosmos-js"
import { createCosmosAddress } from "../../scripts/wallet.js"

const TIMEOUT = 50
const HDPATH = [44, 118, 0, 0, 0]
const ErrVersion = `Error retrieving Cosmos Ledger app version`
const ErrPubKey = `Error getting pubKey from Ledger`
const ErrSign = `Signing transaction with Ledger failed`

export default () => {
  let emptyState = {
    loading: true,
    loaded: false,
    error: null,
    app: null,
    isConnected: false,
    pubKey: null,
    version: null
  }
  let state = JSON.parse(JSON.stringify(emptyState))

  let mutations = {
    setLedger(state, app) {
      state.app = app
    },
    setLedgerCosmosVersion(state, version) {
      state.version = version
    },
    setLedgerPubKey(state, pubKey) {
      state.pubKey = pubKey
    },
    setLedgerConnection(state, isConnected) {
      state.isConnected = isConnected
    }
  }

  let actions = {
    resetSessionData({ rootState }) {
      rootState.ledger = JSON.parse(JSON.stringify(emptyState))
    },
    /* TODO: Create a function to detect ledger is connected (i.e unlocked with
      password and on Home app) */
    async connectLedgerApp({ commit, dispatch, state }) {
      try {
        const comm = await comm_u2f.create_async(TIMEOUT, true)
        let app = new App(comm)
        commit(`setLedger`, app)
        await dispatch(`getLedgerCosmosVersion`)
        commit(`setLedgerConnection`, true)
        await dispatch(`getLedgerPubKey`)
        let address = createCosmosAddress(state.pubKey)
        dispatch(`signIn`, { sessionType: `ledger`, address })
      } catch (error) {
        commit(`notifyError`, {
          title: `Error connecting to Ledger`,
          body: error.message
        })
        Sentry.captureException(error)
        state.error = error
      } finally {
        return !state.error
      }
    },
    async getLedgerCosmosVersion({ commit, dispatch, state }) {
      let response = await state.app.get_version()
      response = await dispatch(`checkLedgerErrors`, response, ErrVersion)
      if (response) {
        const { major, minor, patch, test_mode } = response
        const version = { major, minor, patch, test_mode }
        commit(`setLedgerCosmosVersion`, version)
      }
    },
    async getLedgerPubKey({ commit, dispatch, state }) {
      let response = await state.app.publicKey(HDPATH)
      response = await dispatch(`checkLedgerErrors`, response, ErrPubKey)
      if (response) {
        commit(`setLedgerPubKey`, response.pk)
      }
    },
    // TODO: this assumes Ledger is unlocked and with the Cosmos app open
    async signWithLedger({ commit, dispatch, state }, transaction) {
      let response
      try {
        response = await state.app.sign(HDPATH, transaction)
      } catch (error) {
        commit(`notifyError`, {
          title: ErrSign,
          body: error.message
        })
        Sentry.captureException(error)
        state.error = error
      }

      response = await dispatch(`checkLedgerErrors`, response, ErrSign)
      if (response) {
        return response.signature
      }
      return null
    },
    async checkLedgerErrors({ commit }, response, errorTitle) {
      if (response && response.error_message !== `No errors`) {
        commit(`notifyError`, {
          title: errorTitle,
          body: response.error_message
        })
        Sentry.captureException(response.error_message)
        state.error = response.error_message
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
