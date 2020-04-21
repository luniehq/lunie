/* istanbul ignore next */

import BigNumber from "bignumber.js"

/* returns the a message creator for a specific network and transaction type */
async function getNetworkSpecificMessageCreator(network, messageType) {
  let networkMessages
  try {
    networkMessages = await import(`./networkMessages/${network}.js`)
  } catch (err) {
    throw new Error("Signing for this network is not enabled.")
  }
  const messageFormatter = networkMessages[messageType]

  if (!messageFormatter) {
    throw new Error(
      `Creating the '${messageType}' message for the ${network} network is not supported`
    )
  }

  return messageFormatter
}

/* returns a message object to be signed by a network specific signing algorithm */
export async function getMessage(network, messageType, senderAddress, message) {
  const messageFormatter = await getNetworkSpecificMessageCreator(
    network.id,
    messageType
  )
  return await messageFormatter(senderAddress, message, network)
}

export function getDisplayTransaction(
  messageType,
  messages,
  transactionData,
  network
) {
  if (network.network_type === "cosmos") {
    // TODO extract fee calculation from ActionModal. Also needs on chain applied fees calculation like on Terra SendTx.
    const fees = transactionData.gasPrices.map(({ amount, denom }) => {
      const lookup = network.coinLookup.find(
        ({ chainDenom }) => chainDenom === denom
      )
      return {
        amount: BigNumber(amount).times(lookup.chainToViewConversionFactor),
        denom: lookup.viewDenom
      }
    })

    return messages.map(message => ({
      type: messageType,
      details: message,
      fees
    }))
  }
  if (network.network_type === "polkadot") {
    return messages.map(message => ({
      type: messageType,
      details: message,
      fees: [{ amount: 0 }]
    }))
  }
}
