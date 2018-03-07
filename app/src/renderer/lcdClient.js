'use strict'

const axios = require('axios')

// returns an async function which makes a request for the given
// HTTP method (GET/POST/DELETE/etc) and path (/foo/bar)
function req (method, path) {
  return async function (data) {
    return await this.request(method, path, data)
  }
}

// returns an async function which makes a request for the given
// HTTP method and path, which accepts arguments to be appended
// to the path (/foo/{arg}/...)
function argReq (method, path) {
  return async function (args, data) {
    // `args` can either be a single value or an array
    if (Array.isArray(args)) {
      args = args.join('/')
    }
    if (method === 'DELETE') {
      data = {
        data
      }
    }
    return await this.request(method, `${path}/${args}`, data)
  }
}

class Client {
  constructor (server = 'http://localhost:8998') {
    this.server = server
  }

  async request (method, path, data) {
    try {
      let res = await axios[method.toLowerCase()](this.server + path, data)
      return res.data
    } catch (resError) {
      if (!resError.response || !resError.response.data) {
        throw resError
      }
      let data = resError.response.data
      // server responded with error message, create an Error from that
      let error = Error(data.error)
      error.code = data.code
      throw error
    }
  }
}

let fetchAccount = argReq('GET', '/query/account')
let fetchNonce = argReq('GET', '/query/nonce')

Object.assign(Client.prototype, {
  sign: req('POST', '/sign'),
  postTx: req('POST', '/tx'),

  // keys
  generateKey: req('POST', '/keys'),
  listKeys: req('GET', '/keys'),
  getKey: argReq('GET', '/keys'),
  updateKey: argReq('PUT', '/keys'),
  // axios handles DELETE requests different then other requests, we have to but the body in a config object with the prop data
  deleteKey: argReq('DELETE', '/keys'),
  recoverKey: req('POST', '/keys/recover'),

  // coins
  buildSend: req('POST', '/build/send'),
  async queryAccount (address) {
    try {
      return await fetchAccount.call(this, address)
    } catch (err) {
      // if account not found, return null instead of throwing
      if (err.message.includes('account bytes are empty')) {
        return null
      }
      throw err
    }
  },
  coinTxs: argReq('GET', '/tx/coin'),

  // nonce
  async queryNonce (address) {
    try {
      return await fetchNonce.call(this, address)
    } catch (err) {
      // if nonce not found, return 0 instead of throwing
      if (err.message.includes('nonce empty')) {
        return 0
      }
      throw err
    }
  },

  // Tendermint RPC
  status: req('GET', '/tendermint/status'),

  // staking
  candidate: argReq('GET', '/query/stake/candidates'),
  candidates: req('GET', '/query/stake/candidates'),
  buildDelegate: req('POST', '/build/stake/delegate'),
  buildUnbond: req('POST', '/build/stake/unbond'),
  bondingsByDelegator: argReq('GET', '/tx/bondings/delegator'),
  bondingsByValidator: argReq('GET', '/tx/bondings/validator')

  // TODO: separate API registration for different modules
})

module.exports = Client
