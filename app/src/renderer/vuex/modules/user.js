import dg from 'cosmos-delegation-game'
import level from 'levelup'
import memdown from 'memdown'
import { Wallet } from 'basecoin'
import { PubKey } from 'tendermint-crypto'

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
    setPrivateKey (state, privkey) {
      state.pubkey = privkey.pubkey().bytes().toString('hex')
      state.privkey = privkey
    },
    setAtoms (state, atoms) {
      state.atoms = Math.round(atoms * 100) // measured in atom cents
    },
    setSignedIn (state, signedIn) {
      state.signedIn = signedIn
    },
    signOut (state) {
      state.atoms = 0
      state.nominationActive = false
      state.nomination = JSON.parse(JSON.stringify(emptyNomination))
      state.pubkey = ''
      state.privkey = null
      state.signedIn = false
      state.ownCoinsBonded = 0
      node.wallet = null
    },
    activateNomination (state) {
      state.nominationActive = true
    },
    saveNomination (state, value) {
      state.nomination = value
      console.log('nomination saved: ', JSON.stringify(state.nomination))
    },
    activateDelegation (state) {
      state.delegationActive = true
    }
  }

  const actions = {
    async signIn ({ commit, state }, seedWords) {
      let privkey = dg.mnemonicToPrivKey(seedWords)
      let account = await node.basecoin.getAccount(privkey.address())
      console.log('fetched account', account)
      if (!account) return

      commit('setPrivateKey', privkey)
      commit('setAtoms', Math.floor(account.coins[0].amount / 100))

      // use in-memory data store so key is not persisted
      let store = level({ db: memdown })
      let wallet = node.wallet = Wallet(node.basecoin, store)
      wallet.addAccount(state.privkey)
      wallet.onceReady(() => {
        commit('setSignedIn', true)
        commit('notifyCustom',
          { title: 'Sign In Successful',
            body: 'Welcome to Cosmos Voyager.'})
      })
      wallet.initialize()
    },
    async submitDelegation (state, value) {
      state.delegation = value
      console.log('submitting delegation txs: ', JSON.stringify(state.delegation))
      for (let candidate of value.candidates) {
        let pubKeyBytes = Buffer.from(candidate.id, 'base64')
        let pubKey = PubKey.decode(pubKeyBytes)
        await node.delegationGame.delegate(pubKey, node.wallet, candidate.atoms)
      }
    }
  }

  return { state, mutations, actions }
}
