import config from "src/../config"
import { getSigner } from "./signer"
import transaction from "./transactionTypes"
import { uatoms } from "scripts/num"
import { toMicroDenom } from "src/scripts/common"
import {
  getMessage,
  getMultiMessage,
  getTransactionSigner,
  transformMessage
} from "./MessageConstructor.js"

const txFetchOptions = {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  }
}

export default class ActionManager {
  constructor() {
    this.context = null
    this.message = null
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

    if (!this.message) {
      throw Error(`No message to send.`)
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

  async setMessage(type, transactionProperties) {
    if (!this.context) {
      throw Error("This modal has no context.")
    }
    this.txProps = transactionProperties

    this.messageTypeCheck(type)
    this.messageType = type
    this.message = await getMessage(type, transactionProperties, this.context)
  }

  async transactionAPIRequest(payload) {
    const options = {
      ...txFetchOptions,
      body: JSON.stringify({ payload })
    }

    const command = payload.simulate ? "estimate" : "broadcast"

    return fetch(
      `${config.graphqlHost}/transaction/${command}`,
      options
    ).then(r => r.json())
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

  async simulate(memo) {
    this.readyCheck()
    const gasEstimate = await this.message.simulate({
      memo: memo
    })
    return gasEstimate
  }

  async send(memo, txMetaData) {
    this.readyCheck()

    const { gasEstimate, gasPrice, submitType, password } = txMetaData
    const signer = await getSigner(config, submitType, {
      address: this.context.userAddress,
      password
    })

    if (this.messageType === transaction.WITHDRAW) {
      this.message = await this.createWithdrawTransaction()
    }

    const messageMetadata = {
      gas: String(gasEstimate),
      gasPrices: convertCurrencyData([gasPrice]),
      memo
    }

    const { included, hash } = await this.message.send(messageMetadata, signer)

    return { included, hash }
  }

  async sendTxAPI(context, type, memo, transactionProperties, txMetaData) {
    const { gasEstimate, gasPrice, submitType, password } = txMetaData
    const signer = await getSigner(config, submitType, {
      address: context.userAddress,
      password
    })

    const messageMetadata = {
      gas: String(gasEstimate),
      gasPrices: convertCurrencyData([gasPrice]),
      memo
    }

    let txMessages = []
    if (this.messageType === transaction.WITHDRAW) {
      const validators = getTop5RewardsValidators(
        context.bondDenom,
        context.rewards
      )
      validators.forEach(validator => {
        const txMessage = transformMessage(type, context.userAddress, {
          validatorAddress: validator
        })
        txMessages.push(txMessage)
      })
    } else {
      const txMessage = transformMessage(
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
      signedMessage
    }
    const result = await this.transactionAPIRequest(txPayload)
    if (result.success) {
      return { hash: result.hash }
    } else {
      throw Error("Broadcast was not successfull")
    }
  }

  async createWithdrawTransaction() {
    const addresses = getTop5RewardsValidators(
      this.context.bondDenom,
      this.context.rewards
    )
    return await this.createMultiMessage(transaction.WITHDRAW, {
      validatorAddresses: addresses
    })
  }

  // Withdrawing is a multi message for all validators you have bonds with
  async createMultiMessage(messageType, { validatorAddresses }) {
    const messages = await Promise.all(
      validatorAddresses.map(validatorAddress =>
        getMessage(
          messageType,
          {
            validatorAddress
          },
          this.context
        )
      )
    )
    return await getMultiMessage(this.context, messages)
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

// // limitation of the block, so we pick the top 5 rewards and inform the user.
function getTop5RewardsValidators(bondDenom, rewards) {
  // Compares the amount in a [address1, {denom: amount}] array
  const byBalance = (a, b) => b.amount - a.amount
  const validatorList = rewards
    .sort(byBalance)
    .slice(0, 5) // Just the top 5
    .map(({ validator }) => validator.operatorAddress)

  return validatorList
}
