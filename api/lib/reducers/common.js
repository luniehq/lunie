const BigNumber = require('bignumber.js')
const { keyBy } = require('lodash')

const database = require('../database')
const config = require('../../config.js')

module.exports.getProposalSummary = function getProposalSummary(type) {
  switch (type) {
    case `TEXT`:
      return `This is a text proposal. Text proposals can be proposed by anyone and are used as a signalling mechanism for this community. If this proposal is accepted, nothing will change without community coordination.`
    case `PARAMETER_CHANGE`:
      return `This is a parameter change proposal. Parameter change proposals can be proposed by anyone and include changes to the code of this network. If this proposal is approved the underlying code will change.`
    case `TREASURY`:
      return `This is a treasury proposal. Treasury proposals can be proposed by anyone and are a request for funds from the treasury / community pool.`
    default:
      return `Unknown proposal type`
  }
}

function getRanksForValidators(validators) {
  return validators
    .sort((a, b) => {
      const A = new BigNumber(a.tokens)
      const B = new BigNumber(b.tokens)
      return A.lt(B) ? 1 : -1
    })
    .map((validator, index) => ({
      ...validator,
      rank: ++index
    }))
}

module.exports.getRanksForValidators = getRanksForValidators

module.exports.getValidatorFeed = async function getValidatorFeed(
  operatorAddress,
  networkList,
  dataSource,
  network
) {
  const validatorFeed = await dataSource.db.getAccountNotifications(
    operatorAddress,
    network.id
  )
  return validatorFeed.map((notification) =>
    dataSource.reducers.notificationReducer(notification, networkList)
  )
}

async function getValidatorsProfilesFromDB(
  allValidatorsAddresses,
  networkId,
  db
) {
  const allValidatorsProfiles = await db.getValidatorsProfiles(
    allValidatorsAddresses,
    networkId
  )
  return keyBy(allValidatorsProfiles, `operator_address`)
}

module.exports.getValidatorsProfilesFromDB = getValidatorsProfilesFromDB

module.exports.getValidatorsProfiles = async function getValidatorsProfiles(
  validators,
  dataSource,
  network,
  db
) {
  validators = getRanksForValidators(validators)
  const allValidatorsAddresses = validators.map(
    ({ operatorAddress }) => operatorAddress
  )
  const validatorProfilesDictionary = await getValidatorsProfilesFromDB(
    allValidatorsAddresses,
    validators.find((validator) => validator).networkId,
    db
  )
  return await Promise.all(
    validators.map(async (validator) => {
      let allValidatorDelegations = validator.nominations // for polkadot networks
      if (!allValidatorDelegations) {
        allValidatorDelegations = await dataSource.getAllValidatorDelegations(
          validator
        )
      }
      return dataSource.reducers.validatorProfileReducer(
        validator,
        validatorProfilesDictionary[validator.operatorAddress],
        allValidatorDelegations.length,
        network
      )
    })
  )
}
