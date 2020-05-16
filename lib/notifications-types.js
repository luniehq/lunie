// in this file should be the formatting of the events to user readable content
const eventTypes = {
  BLOCK: 'block',
  TRANSACTION_RECEIVE: 'transactionReceive',
  TRANSACTION_SEND: 'transactionSend',
  VALIDATOR: 'validator',
  PROPOSAL_CREATE: 'proposalCreate',
  PROPOSAL_UPDATE: 'proposalChange'
}

const resourceTypes = {
  TRANSACTION: 'transaction',
  VALIDATOR: 'validator',
  PROPOSAL: 'proposal'
}

/**
 * Returns list of default subscription topics
 *
 * @param { [ Object] } addresses all addresses associated with user account
 * @param {string} addresses.address single address associated with user account
 * @param {string} addresses.networkId associated networkId with address
 * @return { [string] } topics
 */
const getDefaultSubscriptions = (addresses) => {
  let subscriptions = []

  addresses.forEach(({ address, networkId }) => {
    subscriptions.push(
      `${address}_${eventTypes.TRANSACTION_RECEIVE}_${networkId}`,
      `${address}_${eventTypes.TRANSACTION_SEND}_${networkId}`,
      `${eventTypes.PROPOSAL_CREATE}_${networkId}`,
      `${eventTypes.PROPOSAL_UPDATE}_${networkId}`
    )
  })

  return subscriptions
}

module.exports = {
  eventTypes,
  resourceTypes,
  getDefaultSubscriptions
}
