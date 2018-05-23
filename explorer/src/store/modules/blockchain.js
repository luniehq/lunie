import axios from 'axios'

const state = {
  url: 'http://45.77.53.208:46657',
  status: {
    listen_addr: '',
    sync_info: {
      latest_block_height: 0,
      latest_block_hash: ''
    },
    node_info: {
      version: null,
      network: null,
      moniker: null
    }
  },
  peers: [],
  validators: []
}
function reflect (promise) {
  return promise.then(
    function (v) {
      return { v: v, status: 'resolved' }
    },
    function (e) {
      return { e: e, status: 'rejected' }
    }
  )
}

const actions = {
  async getStatus ({ state, commit }) {
    let json = await axios.get(`${state.url}/status`)
    commit('setStatus', json.data.result)
  },
  async getNodes ({ state, commit }) {
    let json = await axios.get(`${state.url}/net_info`)
    commit('setPeers', json.data.result.peers)
    return Promise.resolve()
  },
  getValidators ({ commit, state, dispatch }) {
    let obj = state.peers
      .map(p => p.node_info.listen_addr)
      .reduce((o, key) => ({ ...o, [key]: false }), {})
    commit('setValidators', obj)
    let all = state.peers.map((peer, key) => {
      return new Promise((resolve, reject) => {
        axios
          .get(
            `http://${peer.node_info.listen_addr.replace(46656, 46657)}/status`
          )
          .then(json => {
            commit('setValidator', {
              validator: json.data.result.validator_info,
              key: peer.node_info.listen_addr
            })
            resolve()
          })
          .catch(reject)
      })
    })

    return Promise.all(all.map(reflect))
      .then(function (results) {
        console.log('results', results)
      })
      .catch(error => {
        console.log(error)
      })
  }
}

const mutations = {
  setUrl (state, value) {
    state.url = value
  },
  setStatus (state, value) {
    state.status = value
  },
  setValidators (state, value) {
    state.validators = value
  },
  setPeers (state, value) {
    state.peers = value
  },
  setValidator (state, { validator, key }) {
    state.validators[key] = validator
  }
}

export default {
  state,
  actions,
  mutations
}
