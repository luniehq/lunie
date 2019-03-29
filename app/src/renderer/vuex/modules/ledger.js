import * as Sentry from "@sentry/browser"
import { App, comm_u2f } from "ledger-cosmos-js"
import { createCosmosAddress } from "../../scripts/wallet.js"
import config from "../../../config"

// TODO: discuss TIMEOUT value
const TIMEOUT = 50 // seconds to wait for user action on Ledger

/*
HD wallet derivation path (BIP44)
DerivationPath{44, 118, account, 0, index}
*/
// TODO: add this to state when HD wallet is supported on UI
const HDPATH = [44, 118, 0, 0, 0]
const BECH32PREFIX = `cosmos`

const isSupportedVersion = (leastSupportedVersion, cosmosAppVersion) => {
  if (
    leastSupportedVersion.major > cosmosAppVersion.major ||
    leastSupportedVersion.minor > cosmosAppVersion.minor ||
    leastSupportedVersion.patch > cosmosAppVersion.patch
  ) {
    return false
  }
  return true
}

const checkLedgerErrors = ({ error_message }) => {
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
}

const checkAppMode = (rootState, response) => {
  const { connection } = rootState
  const { device_locked, test_mode } = response

  if (
    test_mode &&
    connection &&
    connection.lastHeader &&
    connection.lastHeader.chain_id.startsWith(`cosmoshub`)
  ) {
    throw new Error(`DANGER: Cosmos app on test mode shouldn't be used on mainnet!`)
  } else if (response && device_locked) {
    throw new Error(`Ledger's screensaver mode is on`)
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
    externals: { App, comm_u2f, createCosmosAddress } // for testing
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
    async pollLedgerDevice({ dispatch, state }) {
      // poll device with low timeout to check if the device is connected
      const secondsTimeout = 3 // a lower value always timeouts
      const communicationMethod = await state.externals.comm_u2f.create_async(
        secondsTimeout,
        true
      )
      const cosmosLedgerApp = new state.externals.App(communicationMethod)

      // check if the version is supported
      await dispatch(`getLedgerCosmosVersion`, cosmosLedgerApp)
      const leastVersion = config.leastLedgerSupportedVersion
      if (!isSupportedVersion(leastVersion, state.cosmosAppVersion)) {
        const msg = `Outdated version: please update Cosmos app to ${leastVersion.full}`
        throw new Error(msg)
      }

      // check if the device is connected or on screensaver mode
      let response
      if (state.cosmosAppVersion && state.cosmosAppVersion.full === `v1.3.1`) {
        await dispatch(`getOpenAppInfo`, cosmosLedgerApp)
      } else if (
        state.cosmosAppVersion && state.cosmosAppVersion.full.startsWith(`v1.1.`)
      ) {
        response = await cosmosLedgerApp.publicKey(HDPATH)
        checkLedgerErrors(response)
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
        const address = await dispatch(`getLedgerAddressAndPubKey`)
        await dispatch(`signIn`, { sessionType: `ledger`, address })
        commit(`setLedgerConnection`, true)
      } catch (error) {
        Sentry.captureException(error)
        commit(`setLedgerError`, error)
        throw error
      }
    },
    async getOpenAppInfo(_, app) {
      const response = await app.appInfo()
      checkLedgerErrors(response)
      const { appName } = response

      if (appName !== `Cosmos`) {
        throw new Error(`Close ${appName} and open the Cosmos app`)
      }
    },
    async getLedgerCosmosVersion(
      { state, rootState, commit },
      app = state.cosmosApp
    ) {
      try {
        const response = await app.get_version()
        checkLedgerErrors(response)
        const { major, minor, patch } = response
        const full = major && minor && patch && `v${major}.${minor}.${patch}`
        checkAppMode(rootState, response)
        const version = { major, minor, patch, full }
        commit(`setCosmosAppVersion`, version)
      } catch (error) {
        Sentry.captureException(error)
        commit(`setLedgerError`, error)
        throw error
      }
    },
    async getLedgerAddressAndPubKey({ commit, state }) {
      try {
        let response
        if (state.cosmosAppVersion.full === `v1.3.1`) {
          response = await state.cosmosApp
            .getAddressAndPubKey(BECH32PREFIX, HDPATH)
        } else if (state.cosmosAppVersion.full.startsWith(`v1.1.`)) {
          response = await state.cosmosApp.publicKey(HDPATH)
          console.log(response)
        } else {
          const leastVersion = config.leastLedgerSupportedVersion
          const msg = `Outdated version: please update Cosmos app to ${leastVersion.full}`
          throw new Error(msg)
        }
        checkLedgerErrors(response)
        const { bech32_address, compressed_pk } = response
        const address = bech32_address ||
          state.externals.createCosmosAddress(compressed_pk)
        commit(`setLedgerPubKey`, compressed_pk)
        return address
      } catch (error) {
        Sentry.captureException(error)
        commit(`setLedgerError`, error)
        throw error
      }
    },
    // TODO: add support on UI: https://github.com/cosmos/lunie/issues/1962
    async showAddressOnLedger({ commit, state }) {
      try {
        const response = await state.cosmosApp.showAddress(BECH32PREFIX, HDPATH)
        checkLedgerErrors(response)
      } catch (error) {
        Sentry.captureException(error)
        commit(`setLedgerError`, error)
        throw error
      }
    },
    async signWithLedger({ commit, state }, message) {
      try {
        const response = await state.cosmosApp.sign(HDPATH, message)
        checkLedgerErrors(response)
        return response.signature
      } catch (error) {
        Sentry.captureException(error)
        commit(`setLedgerError`, error)
        throw error
      }
    }
  }
  return {
    state,
    mutations,
    actions
  }
}
