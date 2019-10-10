const queries = {
    networks: (selection) => `
      query {
        networks${ selection } {
            id
            action_claim_rewards
            action_delegate
            action_deposit
            action_proposal
            action_redelegate
            feature_validators
            feature_session
            feature_proposals
            feature_portfolio
            feature_explorer
            feature_activity
            chain_id
            bech32_prefix
            api_url
            action_vote
            action_undelegate
            action_send
            title
            testnet
            rpc_url
        }
      }
    `,
  }
  module.exports = queries