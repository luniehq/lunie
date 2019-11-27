const { RESTDataSource } = require('apollo-datasource-rest')
const config = require('../config')
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

  async getData(query) {
    const data = await this.post('', {
      query
    })
    if (data.errors) {
      throw new Error(data.errors.map(({ message }) => message).join('\n'))
    }
    return data.data
  }

  async getMaintenance() {
    const { maintenance } = await this.getData(`
    query {
      maintenance {
        id
        message
        show
        type
      }
    }
  `)
    return maintenance
  }

  async getValidatorInfoByAddress(validatorId, networkID) {
    if (networkID === testnet.id) {
      return []
    }

    const selection = networkID
      ? `(where: {operator_address: {_eq: "${validatorId}"}})`
      : ''
    const schema = networkID.replace(/-/g, '_')
    const { [`${schema}_validatorprofiles`]: validatorProfiles } = await this
      .getData(`
      query {
        ${schema}_validatorprofiles${selection}  {
          operator_address
          picture
        }
      }
    `)
    return validatorProfiles.length >= 1 ? validatorProfiles[0] : undefined
  }

  async getValidatorsInfo(networkID) {
    if (networkID === testnet.id) {
      return {}
    }
    const schema = networkID.replace(/-/g, '_')
    const { [`${schema}_validatorprofiles`]: validatorProfiles } = await this
      .getData(`
      query {
        ${schema}_validatorprofiles  {
          operator_address
          picture
        }
      }
    `)
    return validatorProfiles
  }
}

module.exports = LunieDBAPI
