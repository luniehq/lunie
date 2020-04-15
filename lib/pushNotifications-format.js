// in this file should be the formatting of the events to user readable content
const { flatten } = require('lodash')

const eventTypes = {
  BLOCK: 'block',
  TRANSACTION: 'transaction',
  VALIDATOR: 'validator',
  PROPOSAL: 'proposal'
}

/**
 * Returns list of default subscription topics
 * @param { [ Object] } addressObjects all addresses associated with user account
 * @param {string} addressObject.address single address associated with user account
 * @param {string} addressObject.networkId associated networkId with address
 */
const getDefaultSubscriptions = addressObjects => {
  // add addresses to schema and make topics not obligatory: addresses // [{address, networkId}]

  const defaultsTypes = [eventTypes.TRANSACTION] // Hardcoded default type(s) for push registration
  const nestedSubscriptions = addressObjects.map(addressObject => {
    return defaultsTypes.map(
      type => `${addressObject.address}_${type}_${addressObject.networkId}`
    )
  })

  return flatten(nestedSubscriptions)
}

const activeNetworkValidation = activeNetworks => {
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
  getDefaultSubscriptions,
  activeNetworkValidation
}
