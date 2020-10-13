const cosmosV3Reducers = require('./cosmosV3-reducers')
const cosmosV2Reducers = require('./cosmosV2-reducers')

function delegationReducer(delegation, validator, active, network) {
  const coinLookup = network.getCoinLookup(network, delegation.balance.denom)
  const { amount, denom } = cosmosV3Reducers.coinReducer(
    delegation.balance,
    coinLookup
  )

  return {
    id: delegation.validator_address.concat(`-${denom}`),
    validatorAddress: delegation.validator_address,
    delegatorAddress: delegation.delegator_address,
    validator,
    amount,
    active
  }
}

function accountInfoReducer(accountValue, accountType) {
  if (
    accountType.includes(`VestingAccount`) &&
    !accountType.includes(`PeriodicVestingAccount`)
  ) {
    accountValue = accountValue.BaseVestingAccount.BaseAccount
  }
  return {
    address: accountValue.address,
    accountNumber: accountValue.account_number,
    sequence: accountValue.sequence || 0,
    vestingAccount:
      accountType.includes(`VestingAccount`) ||
      accountType.includes(`PeriodicVestingAccount`)
  }
}

module.exports = {
  ...cosmosV3Reducers,
  validatorReducer: cosmosV2Reducers.validatorReducer,
  transactionReducerV2: cosmosV2Reducers.transactionReducerV2,
  delegationReducer,
  accountInfoReducer
}
