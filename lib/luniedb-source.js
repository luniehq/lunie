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
