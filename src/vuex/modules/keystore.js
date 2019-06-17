import * as Sentry from "@sentry/browser"
import { track } from "scripts/google-analytics.js"
import config from "src/config"
import { loadKeys, importKey, testPassword } from "../../scripts/keystore.js"
import { getSeed } from "@lunie/cosmos-keys"

export default () => {
  const state = {
    accounts: [],
    error: null,
    // import into state to be able to test easier
    externals: {
      config,
      loadKeys,
      importKey,
      testPassword,
      getSeed,
      track,
      Sentry
    }
  }

  const mutations = {
    setAccounts(state, accounts) {
      state.accounts = accounts
    }
  }

  const actions = {
    init({ dispatch }) {
      dispatch("loadAccounts")
    },
    async loadAccounts({ commit, state }) {
      state.loading = true
      try {
        const keys = await state.externals.loadKeys()
        commit(`setAccounts`, keys)
      } catch (error) {
        state.externals.Sentry.captureException(error)
        commit(`notifyError`, {
          title: `Couldn't read keys`,
          body: error.message
        })
        state.error = error
      } finally {
        state.loading = false
      }
    },
    async testLogin(store, { password, address }) {
      return await testPassword(address, password)
    },
    createSeed() {
      return state.externals.getSeed()
    },
    async createKey({ dispatch, state }, { seedPhrase, password, name }) {
      state.externals.track(`event`, `session`, `create-keypair`)

      const { cosmosAddress } = await state.externals.importKey(
        name,
        password,
        seedPhrase
      )
      await dispatch("signIn", { password, sessionType: "local" })
      return cosmosAddress
    },
    async getLocalAddress({ state }, localKeyPairName) {
      return state.accounts.find(({ name }) => name === localKeyPairName)
        .address
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
