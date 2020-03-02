import config from "src/../config"
import { getSigner, cancelSign } from "./signer"
import transaction from "./transactionTypes"
import { uatoms } from "scripts/num"
import { toMicroDenom } from "src/scripts/common"
import { getGraphqlHost } from "scripts/url"
import { getFingerprint } from "scripts/fingerprint"
import {
  getSignedTransactionCreator,
  getMessage
} from "./MessageConstructor.js"

const txFetchOptions = fingerprint => ({
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    fingerprint
  }
})

export default class ActionManager {
  async transactionAPIRequest(payload) {
    const fingerprint = await getFingerprint()
    const options = {
      ...txFetchOptions(fingerprint),
      body: JSON.stringify({ payload })
    }
    const command = payload.simulate ? "estimate" : "broadcast"

    const graphqlHost = getGraphqlHost()

    return fetch(
      `${graphqlHost}/transaction/${command}`,
      options
    ).then(result => result.json())
  }

  async cancel({ userAddress, networkId }, submitType) {
    return await cancelSign(submitType, {
      address: userAddress,
      network: networkId
    })
  }

  async simulateTxAPI({ networkId, userAddress }, type, txProps, memo) {
    const txPayload = {
      simulate: true,
      networkId,
      messageType: type,
      address: userAddress,
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

  async sendTxAPI(
    {
      userAddress,
      networkId,
      networkType,
      bondDenom,
      rewards,
      chainId,
      account
    },
    type,
    memo,
    transactionProperties,
    txMetaData
  ) {
    const { gasEstimate, gasPrice, submitType, password } = txMetaData
    const signer = await getSigner(config, submitType, {
      address: userAddress,
      password,
      network: networkId,
      networkType
    })

    const messageMetadata = {
      gas: String(gasEstimate),
      gasPrices: convertCurrencyData([gasPrice]),
      memo
    }

    let txMessages = []
    if (type === transaction.WITHDRAW) {
      const validators = getTop5RewardsValidators(bondDenom, rewards)
      await Promise.all(
        validators.map(async validator => {
          const txMessage = await getMessage(networkId, type, userAddress, {
            validatorAddress: validator
          })
          txMessages.push(txMessage)
        })
      )
    } else {
      const txMessage = await getMessage(
        networkId,
        type,
        userAddress,
        transactionProperties
      )
      txMessages.push(txMessage)
    }

    const createSignedTransaction = await getSignedTransactionCreator(
      networkType
    )
    const signedMessage = await createSignedTransaction(
      messageMetadata,
      txMessages,
      signer,
      chainId,
      account.accountNumber,
      account.sequence
    )

    const txPayload = {
      simulate: false,
      messageType: type,
      networkId,
      senderAddress: userAddress,
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
