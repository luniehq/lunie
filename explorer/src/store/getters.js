export const bc = state => state.blockchain
export const peers = state => {
  return state.blockchain.peers.map(p => {
    p.validator = state.blockchain.validators[p.node_info.listen_addr]
    return p
  })
}
export const config = state => state.config
