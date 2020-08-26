
const cosmosV2Reducers = require('./cosmosV2-reducers')
const {
  atoms,
  coinReducer
} = require('./cosmosV0-reducers')

function blockReducer(networkId, block, transactions, data = {}) {
  return {
    id: block.block_id.hash,
    networkId,
    height: block.block.header.height,
    chainId: block.block.header.chain_id,
    hash: block.block_id.hash,
    time: block.block.header.time,
    transactions,
    proposer_address: block.block.header.proposer_address,
    data: JSON.stringify(data)
  }
}

function validatorReducer(networkId, signedBlocksWindow, validator) {
  const statusInfo = getValidatorStatus(validator)
  let websiteURL = validator.description.website
  if (!websiteURL || websiteURL === '[do-not-modify]') {
    websiteURL = ''
  } else if (!websiteURL.match(/http[s]?/)) {
    websiteURL = `https://` + websiteURL
  }

  return {
    id: validator.operator_address,
    networkId,
    operatorAddress: validator.operator_address,
    consensusPubkey: validator.consensus_pubkey,
    jailed: validator.jailed,
    details: validator.description.details,
    website: websiteURL,
    identity: validator.description.identity,
    name: validator.description.moniker,
    votingPower: validator.voting_power.toFixed(6),
    startHeight: validator.signing_info
      ? validator.signing_info.start_height
      : undefined,
    uptimePercentage: 0, // TODO
    tokens: atoms(validator.tokens),
    commissionUpdateTime: validator.commission.update_time,
    commission: Number(validator.commission.commission_rates.rate).toFixed(6),
    maxCommission: validator.commission.commission_rates.max_rate,
    maxChangeCommission: validator.commission.commission_rates.max_change_rate,
    status: statusInfo.status,
    statusDetailed: statusInfo.status_detailed,
    delegatorShares: validator.delegator_shares, // needed to calculate delegation token amounts from shares
    popularity: validator.popularity
  }
}

function delegationReducer(delegation, validator, active, network) {
  const coinLookup = network.getCoinLookup(network, delegation.balance.denom)
  const {amount, denom} = coinReducer(delegation.balance, coinLookup)

  return {  
    id: delegation.delegation.validator_address.concat(`-${denom}`),
    validatorAddress: delegation.delegation.validator_address,
    delegatorAddress: delegation.delegation.delegator_address,
    validator,
    amount,
    active
  } 
}

function getValidatorStatus(validator) {
  if (validator.status === 3) {
    return {
      status: 'ACTIVE',
      status_detailed: 'active'
    }
  }
  if (
    validator.signing_info &&
    new Date(validator.signing_info.jailed_until) > new Date(9000, 1, 1)
  ) {
    return {
      status: 'INACTIVE',
      status_detailed: 'banned'
    }
  }

  return {
    status: 'INACTIVE',
    status_detailed: 'inactive'
  }
}

module.exports = {
  ...cosmosV2Reducers,
  blockReducer,
  validatorReducer,
  delegationReducer
}
