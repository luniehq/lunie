import * as Sentry from "@sentry/browser"
import { App, comm_u2f } from "ledger-cosmos-js"
import { createCosmosAddress } from "../../scripts/wallet.js"

const TIMEOUT = 2
const HDPATH = [44, 118, 0, 0, 0]

export default () => {
  let emptyState = {
    loading: true,
    loaded: false,
    error: null,
    app: null,
    isConnected: false,
    version: null
  }
  let state = JSON.parse(JSON.stringify(emptyState))

  let mutations = {
    setLedger(state, app) {
      state.app = app
    },
    setVersion(state, version) {
      state.version = version
    },
    setConnection(state, isConnected) {
      state.isConnected = isConnected
    }
  }

  let actions = {
    resetSessionData({ rootState }) {
      rootState.ledger = JSON.parse(JSON.stringify(emptyState))
    },
    /* TODO: Create a function to detect ledger is connected (i.e unlocked with
      password and on Home app) */
    async connectLedgerApp({ commit, dispatch }) {
      try {
        const comm = await comm_u2f.create_async(TIMEOUT, true)
        let app = new App(comm)
        commit(`setLedger`, app)
        const version = await app.get_version()
        commit(`setVersion`, version)
        let address = await dispatch(`getLedgerAddress`)
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
    async getLedgerAddress() {
      const pubKey = await state.app.publicKey(HDPATH)
      return createCosmosAddress(pubKey.pk)
    },
    async signWithLedger({ commit }, transaction) {
      let response
      const app = state.app
      try {
        response = await app.sign_get_chunks(HDPATH, transaction)
      } catch (error) {
        commit(`notifyError`, {
          title: `Error signing transaction with Ledger`,
          body: error.message
        })
        Sentry.captureException(error)
        state.error = error
      }

      if (response && response.error_message !== `No errors`) {
        commit(`notifyError`, {
          title: `Error signing transaction with Ledger`,
          body: response.error_message
        })
        Sentry.captureException(response.error_message)
        state.error = response.error_message
      }
      console.log(response.signature)
      return response.signature
    }
  }
  return {
    state,
    mutations,
    actions
  }
}
