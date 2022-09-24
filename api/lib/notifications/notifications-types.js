const config = require('../../config')

// in this file should be the formatting of the events to user readable content
const eventTypes = {
  /* Block */
  BLOCK: 'block',

  /* Transactions */
  TRANSACTION_RECEIVE: 'transactionReceive',
  TRANSACTION_SEND: 'transactionSend',
  TRANSACTION_CLAIM: 'transactionClaim',

  /* Validators */
  VALIDATOR_ADDED: 'validatorAdded',
  VALIDATOR_COMMISSION: 'validatorCommission',
  VALIDATOR_STATUS: 'validatorStatus',
  VALIDATOR_VOTING_POWER_INCREASE: 'validatorVotingPowerIncrease',
  VALIDATOR_VOTING_POWER_DECREASE: 'validatorVotingPowerDecrease',
  VALIDATOR_PICTURE: 'validatorPicture',
  VALIDATOR_DESCRIPTION: 'validatorDescription',
  VALIDATOR_WEBSITE: 'validatorWebsite',
  VALIDATOR_MAX_CHANGE_COMMISSION: 'validatorMaxChangeCommission',

  /* Proposals */
  PROPOSAL_CREATE: 'proposalCreate',
  PROPOSAL_UPDATE: 'proposalChange',

  /* Lunie */
  LUNIE_UPDATE: 'lunieUpdate',

  /* Slashes */
  SLASH: 'slash',
  LIVENESS: 'liveness'
}

const resourceTypes = {
  TRANSACTION: 'transaction',
  VALIDATOR: 'validator',
  PROPOSAL: 'proposal',
  LUNIE: 'lunie'
}

/**
 * Returns list of default subscription topics
 *
 * @param { [ Object] } addresses all addresses associated with user account
 * @param {string} addresses.address single address associated with user account
 * @param {string} addresses.networkId associated networkId with address
 * @return { [string] } topics
 */
const getDefaultSubscriptions = async (addresses, dataSources) => {
  let subscriptions = []

  for (const { address, networkId } of addresses) {
    const dataSource = dataSources[networkId]
    if (!dataSource) continue
    const delegations = await dataSource.api.getDelegationsForDelegatorAddress(
      address
    )

    delegations.forEach((delegation) => {
      subscriptions.push(
        `${delegation.validatorAddress}_${eventTypes.VALIDATOR_COMMISSION}_${networkId}`,
        `${delegation.validatorAddress}_${eventTypes.VALIDATOR_STATUS}_${networkId}`,
        // `${delegation.validatorAddress}_${eventTypes.VALIDATOR_VOTING_POWER_INCREASE}_${networkId}`,
        // `${delegation.validatorAddress}_${eventTypes.VALIDATOR_VOTING_POWER_DECREASE}_${networkId}`,
        // `${delegation.validatorAddress}_${eventTypes.VALIDATOR_PICTURE}_${networkId}`,
        `${delegation.validatorAddress}_${eventTypes.VALIDATOR_WEBSITE}_${networkId}`,
        `${delegation.validatorAddress}_${eventTypes.VALIDATOR_MAX_CHANGE_COMMISSION}_${networkId}`,
        `${delegation.validatorAddress}_${eventTypes.VALIDATOR_DESCRIPTION}_${networkId}`
      )
    })

    subscriptions.push(
      `${address}_${eventTypes.TRANSACTION_RECEIVE}_${networkId}`,
      `${address}_${eventTypes.TRANSACTION_SEND}_${networkId}`,
      `${eventTypes.PROPOSAL_CREATE}_${networkId}`,
      `${eventTypes.PROPOSAL_UPDATE}_${networkId}`,
      // `${eventTypes.VALIDATOR_ADDED}_${networkId}`,
      `${eventTypes.LUNIE_UPDATE}`
    )
  }

  return subscriptions
}

const getDefaultEmailSubscriptions = async (addresses, dataSources) => {
  let subscriptions = []

  for (const { address, networkId } of addresses) {
    const delegations = await dataSources[
      networkId
    ].api.getDelegationsForDelegatorAddress(address)

    delegations.forEach((delegation) => {
      subscriptions.push(
        `${delegation.validatorAddress}_${eventTypes.VALIDATOR_COMMISSION}_${networkId}`,
        `${delegation.validatorAddress}_${eventTypes.VALIDATOR_STATUS}_${networkId}`,
        `${delegation.validatorAddress}_${eventTypes.SLASH}_${networkId}`,
        `${delegation.validatorAddress}_${eventTypes.LIVENESS}_${networkId}`
      )
    })
    subscriptions.push(
      `${eventTypes.PROPOSAL_CREATE}_${networkId}`,
      `${eventTypes.PROPOSAL_UPDATE}_${networkId}`,
      `${address}_${eventTypes.TRANSACTION_RECEIVE}_${networkId}`
    )
  }

  return subscriptions
}

const getDefaultPushSubscriptions = async (addresses, dataSources) => {
  let subscriptions = []

  for (const { address, networkId } of addresses) {
    const delegations = await dataSources[
      networkId
    ].api.getDelegationsForDelegatorAddress(address)

    delegations.forEach((delegation) => {
      subscriptions.push(
        `${delegation.validatorAddress}_${eventTypes.VALIDATOR_COMMISSION}_${networkId}`,
        `${delegation.validatorAddress}_${eventTypes.VALIDATOR_STATUS}_${networkId}`,
        `${delegation.validatorAddress}_${eventTypes.SLASH}_${networkId}`,
        `${delegation.validatorAddress}_${eventTypes.LIVENESS}_${networkId}`
      )
    })
    subscriptions.push(
      `${eventTypes.PROPOSAL_CREATE}_${networkId}`,
      `${eventTypes.PROPOSAL_UPDATE}_${networkId}`
    )
  }

  return subscriptions
}

module.exports = {
  eventTypes,
  resourceTypes,
  getDefaultSubscriptions,
  getDefaultEmailSubscriptions,
  getDefaultPushSubscriptions
}
