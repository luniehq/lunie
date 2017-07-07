export default ({ commit, basecoin }) => {
  const state = {
    INVITE_TOKENS_MAX: 10,
    CANDIDATE: {
      KEYBASE_MIN: 2,
      KEYBASE_MAX: 16,
      DESCRIPTION_MIN: 20,
      DESCRIPTION_MAX: 40000,
      COMMISSION_MIN: 0,
      COMMISSION_MAX: 99,
      SELF_BOND_MIN: 100,
      SELF_BOND_MAX: 1e10
    }
  }
  const mutations = {}
  return { state, mutations }
}
