const { RESTDataSource } = require("apollo-datasource-rest");
const {
  proposalReducer,
  validatorReducer,
  blockReducer
} = require("./reducers");

class ProposalAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = "https://lcd.nylira.net/";
  }

  async getAllProposals() {
    const response = await this.get("gov/proposals");
    return Array.isArray(response)
      ? response.map(proposal => proposalReducer(proposal))
      : [];
  }

  async getAllValidators() {
    const response = await this.get("staking/validators");
    return Array.isArray(response)
      ? response.map(validator => validatorReducer(validator))
      : [];
  }

  async getProposalById({ proposalId }) {
    const response = await this.get(`gov/proposals/${proposalId}`);
    return proposalReducer(response);
  }

  getProposalsByIds({ proposalIds }) {
    return Promise.all(
      proposalIds.map(proposalId => this.getProposalById({ proposalId }))
    );
  }

  async getBlockById({ blockNumber }) {
    const response = await this.get(`blocks/${blockNumber}`);
    return blockReducer(response);
  }
}

module.exports = ProposalAPI;
