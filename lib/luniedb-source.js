const { RESTDataSource } = require('apollo-datasource-rest')
const config = require('../config');
const queries = require('./queries');

class LunieDBAPI extends RESTDataSource {
  constructor() {
    super()
    this.baseURL = config.hasura_url
  }

  async getData(type, selection = ''){
    const data = await this.post(
      '',
      {
        query: typeof queries[type] !== 'undefined' ? queries[type](selection) : ''
      }, 
      {
        headers: {
            'Content-Type': 'application/json',
            'x-hasura-admin-secret': config.hasura_admin_key
        }
      }
    )
    if (data.errors) {
        throw new Error(data.errors.map(({ message }) => message).join("\n"))
    }
    return data.data[type];
  }

  async getNetworks() {
    const response = await this.getData('networks');
    return response;
  }

  async getNetwork(networkID) {
    const selection = networkID ? `(where: {id: {_eq: "${ networkID }"}})` : ''
    const response = await this.getData('networks', selection);
    return response && response.length ? response[0] : false;
  }

  async getMaintenance() {
    const response = await this.getData('maintenance');
    return response;
  }

  async getValidatorInfoByAddress(validatorId, networkID){
    const selection = networkID ? `(where: {operator_address: {_eq: "${ validatorId }"}})` : ''
    return await this.getData(networkID.replace('-', '_') + '_validatorprofiles', selection);
  }

  async getValidatorsInfo(networkID) {
    return await this.getData(networkID.replace('-', '_') + '_validatorprofiles');
  }
}

module.exports = LunieDBAPI