export default ({ commit, node }) => {
  let lock = null

  let state = {
    nonce: 0,
    loading: false
  }

  const mutations = {
    setNonce (state, nonce) {
      state.nonce = nonce
    }
  }

  async function doSend ({ state, dispatch, commit, rootState }, args) {
    args.sequence = state.nonce
    args.name = rootState.user.account
    args.password = rootState.user.password

    let chainId = rootState.node.lastHeader.chain_id
    args.chain_id = chainId
    args.src_chain_id = chainId // for IBC transfer

    // extract type
    let type = args.type || 'send'
    delete args.type

    // extract "to" address
    let to = args.to
    delete args.to

    // submit to LCD to build, sign, and broadcast
    let res = await node[type](to, args)

    // check response code
    console.log('send response:', res)
    if (res.check_tx.code || res.deliver_tx.code) {
      let message = res.check_tx.log || res.deliver_tx.log
      throw new Error('Error sending transaction: ' + message)
    }

    commit('setNonce', state.nonce + 1)

    // wait to ensure tx is committed before we query
    // XXX
    setTimeout(() => dispatch('queryWalletBalances'), 3 * 1000)
  }

  let actions = {
    async sendTx (...args) {
      // wait to acquire lock
      while (lock != null) { // eslint-disable-line no-unmodified-loop-condition
        await lock
      }

      // send and unlock when done
      lock = doSend(...args)

      // wait for doSend to finish
      let res = await lock
      lock = null

      return res
    }
  }

  return {
    state, mutations, actions
  }
}
