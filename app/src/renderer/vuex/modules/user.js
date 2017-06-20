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

  const state = {
    pubkey: 'AAAAB3NzaC1yc2EAAAADAQABAAACAQDZ67wzRdjbTb9HxduU9YQd9',
    atoms: 24399,
    inviteTokens: 10,
    nominationActive: false,
    nomination: JSON.parse(JSON.stringify(emptyNomination))
  }

  const mutations = {
    useInviteToken (state) {
      console.log('used up one invite token')
      state.inviteTokens--
    },
    resetNomination () {
      state.nomination = JSON.parse(JSON.stringify(emptyNomination))
    },
    activateNomination (state) {
      state.nominationActive = true
    },
    saveNomination (state, value) {
      state.nomination = value
      console.log('nomination saved: ', JSON.stringify(state.nomination))
    }
  }
  return { state, mutations }
}
