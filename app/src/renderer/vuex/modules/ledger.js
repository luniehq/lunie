import * as Sentry from "@sentry/browser"
import { App, comm_u2f } from "ledger-cosmos-js"
import { createCosmosAddress } from "../../scripts/wallet.js"
import { signatureImport, publicKeyVerify, verify } from "secp256k1"
import sha256 from "crypto-js/sha256"

// TODO: discuss TIMEOUT value
const TIMEOUT = 50 // seconds to wait for user action on Ledger
const HDPATH = [44, 118, 0, 0, 0]

const ErrVersion = `Error retrieving Cosmos Ledger app version`
const ErrPubKey = `Error getting pubKey from Ledger`
const ErrSign = `Signing transaction with Ledger failed`

export default () => {
  let emptyState = {
    loading: true,
    loaded: false,
    error: null,
    app: null, // Cosmos ledger app instance
    isConnected: false,
    pubKey: null, // 33 bytes; used for broadcasting signed txs
    uncompressedPubKey: null, // 65 bytes; not used currently
    version: null // Cosmos app version
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

  let actions = {
    resetSessionData({ rootState }) {
      rootState.ledger = JSON.parse(JSON.stringify(emptyState))
    },
    /* TODO: Create a function to detect ledger is connected (i.e unlocked with
      password and on Home app) */
    async connectLedgerApp({ commit, dispatch, state }) {
      try {
        const comm = await comm_u2f.create_async(TIMEOUT, true)
        const app = new App(comm)
        commit(`setLedger`, app)
        await dispatch(`getLedgerCosmosVersion`)
        commit(`setLedgerConnection`, true)
        await dispatch(`getLedgerPubKey`)
        const address = createCosmosAddress(state.pubKey)
        dispatch(`signIn`, { sessionType: `ledger`, address })
      } catch (error) {
        commit(`notifyError`, {
          title: `Error connecting to Ledger`,
          body: error.message
        })
        Sentry.captureException(error)
        commit(`setLedgerError`, error)
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
      if (!publicKeyVerify(response.compressed_pk)) {
        const error = `Invalid public key`
        commit(`notifyError`, {
          title: ErrPubKey,
          body: error
        })
        Sentry.captureException(error)
        commit(`setLedgerError`, error)
      }
      if (response) {
        commit(`setLedgerPubKey`, response.compressed_pk)
        commit(`setLedgerUncompressedPubKey`, response.pk)
      }
    },
    async signWithLedger({ commit, dispatch, state }, message) {
      let response = await state.app.sign(HDPATH, message)
      response = await dispatch(`checkLedgerErrors`, response, ErrSign)
      if (response && response.signature) {
        const messageHash = Buffer.from(sha256(message).toString(), `hex`)
        const signatureBuffer = signatureImport(response.signature)

        if (
          !verify(
            messageHash,
            Buffer.from(signatureBuffer.buffer),
            state.pubKey
          )
        ) {
          debugger
          const error = `signature verification failed`
          commit(`notifyError`, {
            title: ErrSign,
            body: error
          })
          Sentry.captureException(error)
          commit(`setLedgerError`, error)
          return null
        }
        return response.signature
      }
      return undefined
    },
    async checkLedgerErrors({ commit }, response, errorTitle) {
      if (response && response.error_message !== `No errors`) {
        commit(`notifyError`, {
          title: errorTitle,
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
