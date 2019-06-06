import Cosmos from "@lunie/cosmos-js"
import config from "src/config"
import { getSigner } from "./signer"
import transaction from "./transactionTypes"

import { formatCosmosArguments, convertCurrencyData } from "./cosmosMessages"

class ActionManager {
  setContext(context) {
    if (!context) {
      return
    }
    this.context = context
    this.cosmos = new Cosmos(this.context.url || "", this.context.chainId || "")
  }

  async simulate(type, transactionProperties) {
    if (!this.context) {
      throw Error(`This modal has no context.`)
    }

    if (!this.context.connected) {
      throw Error(
        `Currently not connected to a secure node. Please try again when Lunie has secured a connection.`
      )
    }

    const txArguments = formatCosmosArguments(
      this.context,
      type,
      transactionProperties,
      true
    )

    if (txArguments === null) {
      throw Error(
        `Did not complete transaction simulation. Invalid message type: ${type}.`
      )
    }

    const message = this.createCosmosMessage(
      type,
      this.context.userAddress,
      txArguments
    )
    const gasEstimate = await message.simulate({
      memo: transactionProperties.memo
    })
    return gasEstimate
  }

  async send(type, transactionProperties, txMetaData) {
    if (!this.context) {
      throw Error(`This modal has no context.`)
    }

    if (!this.context.connected) {
      throw Error(
        `Currently not connected to a secure node. Please try again when Lunie has secured a connection.`
      )
    }

    const txArguments = formatCosmosArguments(
      this.context,
      type,
      transactionProperties
    )

    if (txArguments === null) {
      throw Error(
        `Did not complete transaction. Invalid message type: ${type}.`
      )
    }

    const { gasEstimate, gasPrice, submitType, password } = txMetaData

    const localKeyPairName = this.context.localKeyPairName
    const signer = getSigner(config, submitType, { localKeyPairName, password })

    let message
    if (type === transaction.WITHDRAW) {
      message = this.createMultiMessage(
        type,
        this.context.userAddress,
        txArguments
      )
    } else {
      message = this.createCosmosMessage(
        type,
        this.context.userAddress,
        txArguments
      )
    }

    const { included } = await message.send(
      {
        gas: String(gasEstimate),
        gas_prices: convertCurrencyData([gasPrice]),
        memo: transactionProperties.memo
      },
      signer
    )
    await included()
  }

  createCosmosMessage(type, senderAddress, txArguments) {
    return this.cosmos[type](senderAddress, txArguments)
  }

  // Withdrawing is a multi message for all validators you have bonds with
  createMultiMessage(type, senderAddress, txArguments) {
    const messages = txArguments.validatorAddresses.map(validatorAddress =>
      this.cosmos[type](senderAddress, { validatorAddress })
    )
    return this.cosmos.MultiMessage(senderAddress, messages)
  }
}

export default ActionManager
