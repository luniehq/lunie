import { KEY_PASSWORD, KEY_NAME } from './wallet'

export default ({ commit, node }) => {
  const emptyNomination = {
    keybase: '',
    country: '',
    website: '',
    startDate: '',
    commission: '',
    serverDetails: '',
    description: '',
    ownCoinsBonded: ''
  }

  const emptyUser = {
    atoms: 0,
    nominationActive: false,
    nomination: JSON.parse(JSON.stringify(emptyNomination)),
    delegationActive: false,
    delegation: [],
    pubkey: '',
    privkey: null,
    signedIn: false
  }

  const state = JSON.parse(JSON.stringify(emptyUser))

  const mutations = {
    activateDelegation (state) {
      state.delegationActive = true
    }
  }

  const actions = {
    async showInitialScreen ({ dispatch }) {
      let exists = await dispatch('accountExists')
      let screen = exists ? 'sign-in' : 'welcome'
      commit('setModalSessionState', screen)
      commit('setModalSession', true)
    },
    async accountExists (state, account = KEY_NAME) {
      try {
        let keys = await node.listKeys()
        return !!keys.find(key => key.name === account)
      } catch (err) {
        commit('notifyError', { title: `Couldn't read keys`, body: err.message })
      }
    },
    // testing if the provided password works so we can show the user early if he uses the wrong password
    // testing this by trying to change the password... to the same password...
    async testLogin (state, {password, account = KEY_NAME}) {
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
      try {
        // cleanup an existing junk account
        let keys = await node.listKeys()
        if (keys.find(key => key.name === JUNK_ACCOUNT_NAME)) {
          await node.deleteKey(JUNK_ACCOUNT_NAME, {
            password: KEY_PASSWORD,
            name: JUNK_ACCOUNT_NAME
          })
        }

        // generate seedPhrase with junk account
        let temporaryKey = await node.generateKey({ name: JUNK_ACCOUNT_NAME, password: KEY_PASSWORD })
        return temporaryKey.seed_phrase
      } catch (err) {
        commit('notifyError', { title: 'Couln\'t create a seed', body: err.message })
      }
    },
    async createKey ({ commit, dispatch }, { seedPhrase, password, name = KEY_NAME }) {
      try {
        let {key} = await node.recoverKey({ name, password, seed_phrase: seedPhrase })
        dispatch('initializeWallet', key)
        return key
      } catch (err) {
        commit('notifyError', { title: 'Couln\'t create a key', body: err.message })
      }
    },
    async deleteKey ({ commit, dispatch }, { password, name = KEY_NAME }) {
      try {
        await node.deleteKey(name, { name, password })
        return true
      } catch (err) {
        commit('notifyError', { title: `Couln't delete account ${name}`, body: err.message })
      }
    },
    async signIn ({ state, dispatch }, {password, account = KEY_NAME}) {
      state.password = password
      state.account = account
      state.signedIn = true

      let key = await node.getKey(account)
      dispatch('initializeWallet', key)
    },
    signOut ({ state, commit, dispatch }) {
      state.password = null
      state.account = null
      state.signedIn = false

      commit('setModalSession', true)
      dispatch('showInitialScreen')
    },
    async submitDelegation (state, value) {
      state.delegation = value
      console.log('submitting delegation txs: ', JSON.stringify(state.delegation))

      for (let candidate of value.candidates) {
        let tx = await node.buildDelegate([ candidate.id, candidate.atoms ])
        // TODO: use wallet key management
        let signedTx = await node.sign({
          name: state.name,
          password: state.default,
          tx
        })
        let res = await node.postTx(signedTx)
        console.log(res)
      }

      commit('activateDelegation', true)
    }
  }

  return { state, mutations, actions }
}
