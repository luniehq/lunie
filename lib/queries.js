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
    maintenance: () => `
      query {
        maintenance {
          id
          message
          show
          type
        }
      }
    `,
    gaia_testnet_validatorprofiles: () => `
      query {
        gaia_testnet_validatorprofiles {
          details
          name
          picture
          operator_address
          website
        }
      }
    `,
    cosmoshub_validatorprofiles: () => `
      query {
        cosmoshub_validatorprofiles {
          details
          name
          picture
          operator_address
          website
        }
      }
    `,
  }
  module.exports = queries