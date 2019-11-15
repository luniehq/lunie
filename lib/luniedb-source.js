const { RESTDataSource } = require('apollo-datasource-rest')
const config = require('../config')
const queries = require('./queries')
const networksLocal = require('../data/networks-local.js')
const testnet = networksLocal['local-cosmos-hub-testnet']

class LunieDBAPI extends RESTDataSource {
  constructor() {
    super()
    this.baseURL = config.hasura_url
  }

  willSendRequest(request) {
    request.headers.set('Content-Type', 'application/json')
    request.headers.set('x-hasura-admin-secret', config.hasura_admin_key)
  }

  async getData(type, selection = '') {
    const data = await this.post('', {
      query:
        typeof queries[type] !== 'undefined' ? queries[type](selection) : ''
    })
    if (data.errors) {
      throw new Error(data.errors.map(({ message }) => message).join('\n'))
    }
    return data.data[type]
  }

  // Not currently used as we have temporarily switched to returning the static data.
  async getNetworks() {
    const response = await this.getData('networks')

    if (config.enableTestnet) {
      response.push(
        // HACK: network.api_url for the testnet has to be different for internal
        // (docker DNS to access the testnet container) and external (this frontend to
        // access the docker container from the outside via it's port)
        Object.assign({}, testnet, {
          api_url: 'http://localhost:9071'
        })
      )
    }

    return response
  }

  // Not currently used as we have temporarily switched to returning the static data.
  async getNetwork(networkID) {
    if (networkID === testnet.id)
      // HACK: network.api_url for the testnet has to be different for internal
      // (docker DNS to access the testnet container) and external (this frontend to
      // access the docker container from the outside via it's port)
      return Object.assign({}, testnet, {
        api_url: 'http://localhost:9071'
      })

    const selection = networkID ? `(where: {id: {_eq: "${networkID}"}})` : ''
    const response = await this.getData('networks', selection)

    return response && response.length ? response[0] : false
  }

  async getMaintenance() {
    const response = await this.getData('maintenance')
    return response
  }

  async getValidatorInfoByAddress(validatorId, networkID) {
    if (networkID === testnet.id) {
      return []
    }

    const selection = networkID
      ? `(where: {operator_address: {_eq: "${validatorId}"}})`
      : ''
    return await this.getData(
      networkID.replace(/-/g, '_') + '_validatorprofiles',
      selection
    )
  }

  async getValidatorsInfo(networkID) {
    if (networkID === testnet.id) {
      return {}
    }
    return await this.getData(
      networkID.replace(/-/g, '_') + '_validatorprofiles'
    )
  }
}

module.exports = LunieDBAPI
