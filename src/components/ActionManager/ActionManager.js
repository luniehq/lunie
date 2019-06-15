import Cosmos from "@lunie/cosmos-js"
import config from "src/config"
import { getSigner } from "./signer"
import transaction from "./transactionTypes"
import { getTop5Delegations } from "../../utils"
import { uatoms } from "scripts/num.js"

export default class ActionManager {
  constructor() {
    this.context = null
    this.cosmos = null
  }

  setContext(context = null) {
    if (!context) {
      throw Error("Context cannot be empty")
    }
    this.context = context
    this.cosmos = new Cosmos(this.context.url || "", this.context.chainId || "")
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

  async simulate(type, memo, transactionProperties) {
    this.messageTypeCheck(type)
    this.readyCheck()

    // When simulating a withdrawal, ignore validator addresses
    let txArguments = transactionProperties
    if (type === transaction.WITHDRAW) {
      txArguments.validatorAddress = []
    }

    const message = this.cosmos[type](this.context.userAddress, txArguments)
    const gasEstimate = await message.simulate({
      memo: transactionProperties.memo
    })
    return gasEstimate
  }

  async send(type, memo, transactionProperties, txMetaData) {
    this.messageTypeCheck(type)
    this.readyCheck()
    const { gasEstimate, gasPrice, submitType, password } = txMetaData
    const localKeyPairName = this.context.localKeyPairName
    const signer = getSigner(config, submitType, { localKeyPairName, password })

    let message
    if (type === transaction.WITHDRAW) {
      message = this.createWithDrawTransaction(type, transactionProperties)
    } else {
      message = this.cosmos[type](
        this.context.userAddress,
        transactionProperties
      )
    }

    const { included } = await message.send(
      {
        gas: String(gasEstimate),
        gas_prices: convertCurrencyData([gasPrice]),
        memo
      },
      signer
    )
    await included()
  }

  createWithDrawTransaction(transactionProperties) {
    const newTxProps = this.formatWithdrawalProperties(
      this.context,
      transactionProperties
    )
    return this.createMultiMessage(
      transaction.WITHDRAW,
      this.context.userAddress,
      newTxProps
    )
  }

  // limitation of the block, so we pick the top 5 rewards and inform the user.
  formatWithdrawalProperties(context, { validatorAddress }) {
    let validatorAddresses
    if (validatorAddress) {
      validatorAddresses = [validatorAddress]
    } else {
      const top5Delegations = getTop5Delegations(context.committedDelegations)
      validatorAddresses = Object.keys(top5Delegations)
    }

    return { validatorAddresses }
  }

  // Withdrawing is a multi message for all validators you have bonds with
  createMultiMessage(type, senderAddress, txArguments) {
    const messages = txArguments.validatorAddresses.map(validatorAddress =>
      this.cosmos[type](senderAddress, { validatorAddress })
    )
    return this.cosmos.MultiMessage(senderAddress, messages)
  }
}

function convertCurrencyData(amounts) {
  return amounts.map(({ amount, denom }) => ({
    amount: toMicroAtomString(amount),
    denom
  }))
}

function toMicroAtomString(amount) {
  return String(uatoms(amount))
}
