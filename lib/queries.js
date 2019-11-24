const queries = {
  networks: selection => `
      query {
        networks${selection} {
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
            stakingDenom
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
  cosmos_hub_testnet_validatorprofiles: selection => `
      query {
        cosmos_hub_testnet_validatorprofiles${selection}  {
          details
          name
          picture
          operator_address
          website
        }
      }
    `,
  cosmos_hub_mainnet_validatorprofiles: selection => `
      query {
        cosmos_hub_mainnet_validatorprofiles${selection}  {
          operator_address
          picture
        }
      }
    `,
  terra_testnet_validatorprofiles: selection => `
      query {
        terra_testnet_validatorprofiles${selection}  {
          operator_address
          picture
        }
      }
    `
}
module.exports = queries
