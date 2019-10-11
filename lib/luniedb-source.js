const { RESTDataSource } = require('apollo-datasource-rest')
const axios = require("axios");
const config = require('../config');
const queries = require('./queries');

class LunieDBAPI extends RESTDataSource {
  constructor() {
    super()
    this.baseURL = config.hasura_url
  }

  async getData(type, networkID = ''){
    const selection = networkID ? `(where: {id: {_eq: "${ networkID }"}})` : ''
    const { data } = await axios({
        url: this.baseURL,
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'x-hasura-admin-secret': config.hasura_admin_key
        },
        data: {
            query: typeof queries[type] !== 'undefined' ? queries[type](selection) : ''
        }
    })
    if (data.errors) {
        throw new Error(data.errors.map(({ message }) => message).join("\n"))
    }
    return data.data[type];
  }

  async getNetworks() {
    const response = await this.getData('networks');
    return response;
  }

  async getNetwork(id) {
    const response = await this.getData('networks', id);
    return response && response.length ? response[0] : false;
  }

  async getMaintenance(id) {
    const response = await this.getData('maintenance');
    return response;
  }

}

module.exports = LunieDBAPI
