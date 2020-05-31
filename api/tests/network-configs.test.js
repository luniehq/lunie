const Joi = require('@hapi/joi')
const { allNetworks } = require('../lib/networks')

const coinLookup = Joi.object().keys({
  chainDenom: Joi.string(),
  viewDenom: Joi.string(),
  chainToViewConversionFactor: Joi.number()
})

const schema = Joi.object({
  id: Joi.string().lowercase(),
  title: Joi.string(),
  chain_id: Joi.string(),
  rpc_url: Joi.string().uri(),
  api_url: Joi.string().uri(),
  bech32_prefix: Joi.string(),
  address_prefix: Joi.string(),
  address_creator: Joi.string(),
  network_type: Joi.string(),
  ledger_app: Joi.string(),
  source_class_name: Joi.string(),
  block_listener_class_name: Joi.string(),
  testnet: Joi.boolean(),
  feature_explore: Joi.string().valid('ENABLED', 'DISABLED', 'MISSING'),
  feature_session: Joi.string().valid('ENABLED', 'DISABLED', 'MISSING'),
  feature_portfolio: Joi.string().valid('ENABLED', 'DISABLED', 'MISSING'),
  feature_validators: Joi.string().valid('ENABLED', 'DISABLED', 'MISSING'),
  feature_proposals: Joi.string().valid('ENABLED', 'DISABLED', 'MISSING'),
  feature_activity: Joi.string().valid('ENABLED', 'DISABLED', 'MISSING'),
  feature_explorer: Joi.string().valid('ENABLED', 'DISABLED', 'MISSING'),
  action_send: Joi.string().valid('ENABLED', 'DISABLED', 'MISSING'),
  action_claim_rewards: Joi.string().valid('ENABLED', 'DISABLED', 'MISSING'),
  action_delegate: Joi.string().valid('ENABLED', 'DISABLED', 'MISSING'),
  action_redelegate: Joi.string().valid('ENABLED', 'DISABLED', 'MISSING'),
  action_undelegate: Joi.string().valid('ENABLED', 'DISABLED', 'MISSING'),
  action_deposit: Joi.string().valid('ENABLED', 'DISABLED', 'MISSING'),
  action_vote: Joi.string().valid('ENABLED', 'DISABLED', 'MISSING'),
  action_proposal: Joi.string().valid('ENABLED', 'DISABLED', 'MISSING'),
  default: Joi.boolean(),
  stakingDenom: Joi.string().uppercase(),
  coinLookup: Joi.array().items(coinLookup).optional(),
  enabled: Joi.boolean(),
  experimental: Joi.boolean(),
  icon: Joi.string().optional(),
  slug: Joi.string().optional(),
  powered: Joi.object()
    .keys({
      name: Joi.string().optional(),
      providerAddress: Joi.string().optional(),
      picture: Joi.string().optional()
    })
    .optional(),
  lockUpPeriod: Joi.string().optional()
})

describe('Network configs', function () {
  const options = {
    presence: 'required',
    abortEarly: false
  }

  allNetworks.forEach((networkConfig) => {
    it(`${networkConfig.id} is valid `, function () {
      const { error } = schema.validate(networkConfig, options)
      expect(error).toBeFalsy()
    })
  })
})
