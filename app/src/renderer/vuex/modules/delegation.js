import axios from 'axios'

export default ({ dispatch, node }) => {
  const actions = {
    async submitDelegation ({state, commit}, {
        value,
        candidate,
        userAddress,
        account,
        password
    }) {
      let tx = (await axios.post('http://localhost:8998/build/stake/delegate', {
        'from': {
          'app': 'Cosmos',
          'addr': userAddress
        },
        'pub_key': candidate.pub_key,
        'sequence': 1,
        'amount': {
          'denom': 'fermion',
          'amount': value
        }
      })).data
        // TODO move to cosmos-sdk
        // let tx = await node.buildDelegate([ delegate.id, delegate.atoms ])
      let signedTx = await node.sign({
        name: account,
        password,
        tx
      })
      let res = await node.postTx(signedTx)
      if (res.check_tx.gas === '0') {
        throw new Error(`Delegating to ${candidate.pub_key.data} failed: ${res.check_tx.log}`)
      }
    }
  }

  return { actions }
}
