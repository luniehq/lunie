import config from "src/../config"
import { getSigner, cancelSign } from "./signer"
import transaction from "./transactionTypes"
import { uatoms } from "scripts/num"
import { toMicroDenom } from "src/scripts/common"
import { getGraphqlHost } from "scripts/url"
import { getTransactionSigner, getMessage } from "./MessageConstructor.js"

const txFetchOptions = {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  }
}

export default class ActionManager {
  constructor() {
    this.context = null
  }

  setContext(context = null) {
    if (!context) {
      throw Error("Context cannot be empty")
    }
    this.context = context
  }

  readyCheck() {
    if (!this.context) {
      throw Error("This modal has no context.")
    }

    if (!this.context.connected) {
      throw Error(
        `Currently not connected to a secure node. Please try again when Lunie has secured a connection.`
      )
    }
  }

  messageTypeCheck(msgType) {
    if (!msgType) {
      throw Error("No message type present.")
    }

    const isKnownType = Object.values(transaction).includes(msgType)
    if (!isKnownType) {
      throw Error(`Invalid message type: ${msgType}.`)
    }
  }

  async transactionAPIRequest(payload) {
    const options = {
      ...txFetchOptions,
      body: JSON.stringify({ payload })
    }

    const command = payload.simulate ? "estimate" : "broadcast"

    const graphqlHost = getGraphqlHost()

    return fetch(
      `${graphqlHost}/transaction/${command}`,
      options
    ).then(result => result.json())
  }

  async cancel(context, submitType) {
    return await cancelSign(submitType, {
      address: context.userAddress,
      network: context.networkId
    })
  }

  async simulateTxAPI(context, type, txProps, memo) {
    const txPayload = {
      simulate: true,
      networkId: context.networkId,
      messageType: type,
      address: context.userAddress,
      txProperties: txProps,
      memo
    }
    const result = await this.transactionAPIRequest(txPayload)
    if (result.success) {
      return result.gasEstimate
    } else {
      throw Error("Simulation unsuccessful")
    }
  }

  async sendTxAPI(context, type, memo, transactionProperties, txMetaData) {
    const { gasEstimate, gasPrice, submitType, password } = txMetaData
    const signer = await getSigner(config, submitType, {
      address: context.userAddress,
      password,
      network: context.networkId
    })

    const messageMetadata = {
      gas: String(gasEstimate),
      gasPrices: convertCurrencyData([gasPrice]),
      memo
    }

    let txMessages = []
    if (type === transaction.WITHDRAW) {
      const validators = getTop5RewardsValidators(
        context.bondDenom,
        context.rewards
      )
      await Promise.all(
        validators.map(async validator => {
          const txMessage = await getMessage(
            context.networkId,
            type,
            context.userAddress,
            {
              validatorAddress: validator
            }
          )
          txMessages.push(txMessage)
        })
      )
    } else {
      const txMessage = await getMessage(
        context.networkId,
        type,
        context.userAddress,
        transactionProperties
      )
      txMessages.push(txMessage)
    }

    const createSignedTransaction = await getTransactionSigner(context)
    const signedMessage = await createSignedTransaction(
      messageMetadata,
      txMessages,
      signer,
      context.chainId,
      context.account.accountNumber,
      context.account.sequence
    )

    const txPayload = {
      simulate: false,
      messageType: type,
      networkId: context.networkId,
      senderAddress: context.userAddress,
      signedMessage
    }
    const result = await this.transactionAPIRequest(txPayload)
    if (result.success) {
      return { hash: result.hash }
    } else {
      throw Error("Broadcast was not successful: " + result.error)
    }
  }
}

function convertCurrencyData(amounts) {
  return amounts.map(({ amount, denom }) => ({
    amount: toMicroAtomString(amount),
    denom: toMicroDenom(denom)
  }))
}

function toMicroAtomString(amount) {
  return String(uatoms(amount))
}

// limitation of the Ledger Nano S, so we pick the top 5 rewards and inform the user.
function getTop5RewardsValidators(bondDenom, rewards) {
  // Compares the amount in a [address1, {denom: amount}] array
  const byBalance = (a, b) => b.amount - a.amount
  const validatorList = rewards
    .filter(({ denom }) => denom == bondDenom)
    .sort(byBalance)
    .slice(0, 5) // Just the top 5
    .map(({ validator }) => validator.operatorAddress)

  return validatorList
}
