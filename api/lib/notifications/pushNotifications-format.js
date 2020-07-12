// in this file should be the formatting of the events to user readable content
const eventTypes = {
  BLOCK: 'block',
  TRANSACTION: 'transaction',
  VALIDATOR: 'validator',
  PROPOSAL_CREATE: 'proposalCreation',
  PROPOSAL_UPDATE: 'proposalChange'
}

/**
 * Returns list of default subscription topics for transactions
 * @param { [ Object] } addressObjects all addresses associated with user account
 * @param {string} addressObject.address single address associated with user account
 * @param {string} addressObject.networkId associated networkId with address
 * @return { [string] } topics
 */
const getDefaultTransactionSubscriptions = (addressObjects) => {
  return addressObjects.map(
    (addressObject) =>
      `${addressObject.address}_${eventTypes.TRANSACTION}_${addressObject.networkId}`
  )
}

/**
 * Returns list of default subscription topics for new proposals
 * @param { [ Object] } addressObjects all addresses associated with user account
 * @param {string} addressObject.address single address associated with user account
 * @param {string} addressObject.networkId associated networkId with address
 * @return { [string] } topics
 */
const getDefaultProposalUpdateSubscriptions = (addressObjects) => {
  return addressObjects.map(
    (addressObject) =>
      `${eventTypes.PROPOSAL_UPDATE}_${addressObject.networkId}`
  )
}

/**
 * Returns list of default subscription topics for changed proposals (status updates)
 * @param { [ Object] } addressObjects all addresses associated with user account
 * @param {string} addressObject.address single address associated with user account
 * @param {string} addressObject.networkId associated networkId with address
 * @return { [string] } topics
 */
const getDefaultProposalCreationSubscriptions = (addressObjects) => {
  return addressObjects.map(
    (addressObject) =>
      `${eventTypes.PROPOSAL_CREATE}_${addressObject.networkId}`
  )
}

const activeNetworkValidation = (activeNetworks) => {
  if (
    !Array.isArray(activeNetworks) ||
    activeNetworks.find(
      ({ address, networkId }) =>
        typeof networkId !== 'string' || typeof address !== 'string'
    )
  ) {
    throw Error('Push registration has bad format')
  }
}

module.exports = {
  eventTypes,
  getDefaultTransactionSubscriptions,
  getDefaultProposalUpdateSubscriptions,
  getDefaultProposalCreationSubscriptions,
  activeNetworkValidation
}
