import dg from 'cosmos-delegation-game'

export default ({ commit, node }) => {
  const emptyNomination = {
    keybase: '',
    country: '',
    website: '',
    startDate: '',
    commission: '',
    serverPower: '',
    description: ''
  }

  const emptyUser = {
    atoms: 0,
    nominationActive: false,
    nomination: JSON.parse(JSON.stringify(emptyNomination)),
    delegationActive: false,
    delegation: [],
    pubkey: '',
    signedIn: false
  }

  const state = JSON.parse(JSON.stringify(emptyUser))

  const mutations = {
    // TODO: fix hardcoded user stats
    signIn (state, seedWords) {
      let privkey = dg.mnemonicToPrivKey(seedWords)
      let address = privkey.address().toString('hex')
      let allocation = dg.allocation[address]
      if (allocation == null) {
        // TODO: show error
        // this account does not have any atoms
        return
      }
      state.atoms = Math.round(allocation * 100) // measured in atom cents
      state.privkey = privkey
      state.pubkey = privkey.pubkey().bytes().toString('hex')
      state.signedIn = true
    },
    signOut (state) {
      state.atoms = 0
      state.nominationActive = false
      state.nomination = JSON.parse(JSON.stringify(emptyNomination))
      state.pubkey = ''
      state.signedIn = false
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
    },
    saveDelegation (state, value) {
      state.delegation = value
      console.log('delegation saved: ', JSON.stringify(state.delegation))
    }
  }
  return { state, mutations }
}
