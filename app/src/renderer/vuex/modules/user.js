export default ({ commit, node }) => {
  const state = {
    atoms: 0,
    signedIn: false,
    accounts: [],
    password: null,
    account: null,
    address: null
  }

  const mutations = {
    activateDelegation (state) {
      state.delegationActive = true
    },
    setAccounts (state, accounts) {
      state.accounts = accounts
    },
    setAtoms (state, atoms) {
      state.atoms = atoms
    }
  }

  const actions = {
    async showInitialScreen ({ dispatch, commit }) {
      await dispatch('loadAccounts')
      let exists = state.accounts.length > 0
      let screen = exists ? 'sign-in' : 'welcome'
      commit('setModalSessionState', screen)
      commit('setModalSession', true)
    },
    async loadAccounts ({ commit }) {
      try {
        let keys = await node.listKeys()
        commit('setAccounts', keys)
      } catch (err) {
        commit('notifyError', { title: `Couldn't read keys`, body: err.message })
      }
    },
    async testLogin (state, { password, account }) {
      try {
        return await node.updateKey(account, {
          name: account,
          password: password,
          new_passphrase: password
        })
      } catch (err) {
        throw Error('Incorrect passphrase')
      }
    },
    // to create a temporary seed phrase, we create a junk account with name 'trunk' for now
    async createSeed ({ commit }) {
      let JUNK_ACCOUNT_NAME = 'trunk'
      let TRUNK_PASSWORD = '1234567890'
      try {
        // cleanup an existing junk account
        let keys = await node.listKeys()
        if (keys.find(key => key.name === JUNK_ACCOUNT_NAME)) {
          await node.deleteKey(JUNK_ACCOUNT_NAME, {
            password: TRUNK_PASSWORD,
            name: JUNK_ACCOUNT_NAME
          })
        }

        // generate seedPhrase with junk account
        let temporaryKey = await node.generateKey({ name: JUNK_ACCOUNT_NAME, password: TRUNK_PASSWORD })
        return temporaryKey.seed_phrase
      } catch (err) {
        commit('notifyError', { title: `Couldn't create a seed`, body: err.message })
      }
    },
    async createKey ({ commit, dispatch }, { seedPhrase, password, name }) {
      try {
        let {key} = await node.recoverKey({ name, password, seed_phrase: seedPhrase })
        dispatch('initializeWallet', key)
        return key
      } catch (err) {
        commit('notifyError', { title: `Couldn't create a key`, body: err.message })
      }
    },
    async deleteKey ({ commit, dispatch }, { password, name }) {
      try {
        await node.deleteKey(name, { name, password })
        return true
      } catch (err) {
        commit('notifyError', { title: `Couldn't delete account ${name}`, body: err.message })
      }
    },
    async signIn ({ state, dispatch }, { password, account }) {
      state.password = password
      state.account = account
      state.signedIn = true

      let key = await node.getKey(account)
      state.address = key.address

      dispatch('initializeWallet', key)
    },
    signOut ({ state, commit, dispatch }) {
      state.password = null
      state.account = null
      state.signedIn = false

      commit('setModalSession', true)
      dispatch('showInitialScreen')
    }
  }

  return { state, mutations, actions }
}
