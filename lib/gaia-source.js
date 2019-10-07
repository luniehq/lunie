const { RESTDataSource } = require("apollo-datasource-rest");
const chainpubsub = require("./chain-pubsub");
const {
  proposalReducer,
  validatorReducer,
  blockReducer
} = require("./reducers/gaia-reducers");

class GaiaAPI extends RESTDataSource {
  constructor(network) {
    super();
    this.baseURL = network.api_url;
    this.initialize({});
    this.wsClient = chainpubsub.client(network.rpc_url);
    this.wsClient.subscribe({ query: "tm.event='NewBlock'" }, async event => {
      const block = await this.getBlockByHeight({
        blockHeight: event.block.header.height
      });
      chainpubsub.publishBlockAdded(network.id, block);
    });
  }

  async getAllProposals() {
    const response = await this.get("gov/proposals");
    return Array.isArray(response.result)
      ? response.result.map(proposal => proposalReducer(proposal))
      : [];
  }

  async getAllValidators() {
    const response = await this.get("staking/validators");
    return Array.isArray(response.result)
      ? response.result.map(validator => validatorReducer(validator))
      : [];
  }

  async getValidatorByAddress({ address }) {
    const response = await this.get(`staking/validators/${address}`);
    return validatorReducer(response.result);
  }

  async getProposalById({ proposalId }) {
    const response = await this.get(`gov/proposals/${proposalId}`);
    return proposalReducer(response.result);
  }

  async getBlockByHeight({ blockHeight }) {
    let response;
    if (blockHeight) {
      response = await this.get(`blocks/${blockHeight}`);
    } else {
      response = await this.get(`blocks/latest`);
    }
    return blockReducer(response);
  }
}

module.exports = GaiaAPI;
