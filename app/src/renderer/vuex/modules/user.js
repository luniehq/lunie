import dg from 'cosmos-delegation-game'
import level from 'levelup'
import memdown from 'memdown'
import { Wallet } from 'basecoin'
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
    signIn (state, password, account = KEY_NAME) {
      state.password = password
      state.account = account
      state.signedIn = true
    },
    setSignedIn (state, signedIn) {
      state.signedIn = signedIn
    },
    signOut (state) {
      state.password = null
      state.account = null
      state.signedIn = false
    },
    activateDelegation (state) {
      state.delegationActive = true
    }
  }

  const actions = {
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
        debugger
        commit('notifyError', { title: 'Couln\'t create a key', body: err.message })
      }
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
