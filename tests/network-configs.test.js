const Joi = require('@hapi/joi')
const { allNetworks } = require('../lib/networks')

const schema = Joi.object({
  id: Joi.string().lowercase(),
  title: Joi.string(),
  chain_id: Joi.string(),
  rpc_url: Joi.string().uri(),
  api_url: Joi.string().uri(),
  bech32_prefix: Joi.string(),
  address_prefix: Joi.string(),
  address_creator: Joi.string(),
  ledger_app: Joi.string(),
  source_class_name: Joi.string(),
  block_listener_class_name: Joi.string(),
  testnet: Joi.boolean(),
  feature_explore: Joi.boolean(),
  feature_session: Joi.boolean(),
  feature_portfolio: Joi.boolean(),
  feature_validators: Joi.boolean(),
  feature_proposals: Joi.boolean(),
  feature_activity: Joi.boolean(),
  feature_explorer: Joi.boolean(),
  action_send: Joi.boolean(),
  action_claim_rewards: Joi.boolean(),
  action_delegate: Joi.boolean(),
  action_redelegate: Joi.boolean(),
  action_undelegate: Joi.boolean(),
  action_deposit: Joi.boolean(),
  action_vote: Joi.boolean(),
  action_proposal: Joi.boolean(),
  default: Joi.boolean(),
  stakingDenom: Joi.string().uppercase(),
  enabled: Joi.boolean(),
  experimental: Joi.boolean().optional(),
  icon: Joi.string().optional(),
  slug: Joi.string().optional()
})

describe('Network configs', function() {
  const options = {
    presence: 'required',
    abortEarly: false
  }

  allNetworks.forEach(networkConfig => {
    it(`${networkConfig.id} is valid `, function() {
      const { error } = schema.validate(networkConfig, options)
      expect(error).toBeFalsy()
    })
  })
})
