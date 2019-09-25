const { RESTDataSource } = require('apollo-datasource-rest');

class ProposalAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://lcd.nylira.net/';
  }

  async getAllProposals() {
    const response = await this.get('gov/proposals');
    return Array.isArray(response)
      ? response.map(proposal => this.proposalReducer(proposal))
      : [];
  }

  async getProposalById({ proposalId }) {
    const response = await this.get(`gov/proposals/${proposalId}`);
    return this.proposalReducer(response);
  }

  getProposalsByIds({ proposalIds }) {
    return Promise.all(
      proposalIds.map(proposalId => this.getProposalById({ proposalId })),
    );
  }

  proposalReducer(proposal) {
    return {
      id: Number(proposal.proposal_id),
      type: proposal.proposal_content.type,
      title: proposal.proposal_content.value.title,
      description: proposal.proposal_content.value.description,
      status: proposal.proposal_status,
      final_tally_yes: proposal.final_tally_result.yes,
      final_tally_abstain: proposal.final_tally_result.abstain,
      final_tally_no: proposal.final_tally_result.no,
      final_tally_no_with_veto: proposal.final_tally_result.no_with_veto
    };
  }
}

module.exports = ProposalAPI
