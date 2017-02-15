export default ({ basecoin }) => {
  const { wallets } = basecoin
  const state = wallets.default.txs
  const mutations = {}
  return { state, mutations }
}
