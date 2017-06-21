export default ({ commit, basecoin }) => {
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
    signIn () {
      state.atoms = 59999
      state.pubkey = 'AAAAB3NzaC1yc2EAAAADAQABAAACAQDZ67wzRdjbTb9HxduU9YQd9'
      state.signedIn = true
    },
    signOut () {
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
