const BigNumber = require('bignumber.js')

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

module.exports.getRanksForValidators = function getRanksForValidators(
  validators
) {
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

module.exports.getAllValidatorsFeed = async function getAllValidatorsFeed(
  validators,
  allValidatorsAddresses,
  networkList,
  dataSource,
  network
) {
  const allValidatorsFeed = await dataSource.db.getAccountsNotifications(
    allValidatorsAddresses,
    network.id
  )
  return validators.map((validator) => {
    const validatorFeed = allValidatorsFeed.filter(
      ({ resourceId }) => resourceId === validator.operatorAddress
    )
    return {
      ...validator,
      feed:
        validatorFeed && Array.isArray(validatorFeed)
          ? validatorFeed.map((notification) =>
              dataSource.reducers.notificationReducer(notification, networkList)
            )
          : []
    }
  })
}
