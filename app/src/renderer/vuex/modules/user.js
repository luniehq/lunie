import axios from 'axios'
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
    signIn (state, {password, account = KEY_NAME}) {
      state.password = password
      state.account = account
      state.signedIn = true
    },
    activateDelegation (state) {
      state.delegationActive = true
    }
  }

  const actions = {
    async accountExists (state, account = KEY_NAME) {
      try {
        let keys = await node.listKeys()
        return !!keys.find(key => key.name === account)
      } catch (err) {
        commit('notifyError', { title: `Couldn't read keys'`, body: err.message })
      }
    },
    async testLogin (state, {password, account = KEY_NAME}) {
      try {
        await node.updateKey(account, {
          name: account,
          password: password,
          new_passphrase: password
        })
      } catch (err) {
        commit('notifyError', { title: `Couldn't login to '${account}'`, body: err.message })
      }
    },
    async createSeed ({ commit }) {
      try {
        // cleanup
        try {
          await node.deleteKey('trunk', {
            password: KEY_PASSWORD,
            name: 'trunk'
          })
        } catch (err) {
          // ignore if this fails as we get an error anyway while creating if this fails and this fails if there is no key with that name
        }
        let temporaryKey = await node.generateKey({ name: 'trunk', password: KEY_PASSWORD })
        return temporaryKey.seed_phrase
      } catch (err) {
        commit('notifyError', { title: 'Couln\'t create a seed', body: err.message })
      }
    },
    async createKey ({ commit, dispatch }, { seedPhrase, password, name = KEY_NAME }) {
      try {
        let {key} = await node.recoverKey({ name, password, seed_phrase: seedPhrase })
        dispatch('initializeWallet')
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
    signOut ({ state, commit }) {
      state.password = null
      state.account = null
      state.signedIn = false
      commit('setModalSession', true)
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
