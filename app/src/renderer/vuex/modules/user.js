export default ({ commit, basecoin }) => {
  const emptyNomination = {
    active: false,
    keybase: '',
    country: '',
    website: '',
    startDate: '',
    commission: '',
    serverPower: '',
    description: ''
  }

  const state = {
    pubkey: 'asdofiandsfa223',
    atoms: 24380,
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
    submitNomination (state, value) {
      state.nomination.active = true
      state.nomination = value
      console.log('nomination submitted: ', JSON.stringify(state.nomination))
    }
  }
  return { state, mutations }
}
