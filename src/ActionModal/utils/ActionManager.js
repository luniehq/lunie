import config from "src/../config"
import { getSigner, cancelSign, signQueue } from "./signer"
import transaction from "./transactionTypes"
import { toMicroUnit } from "scripts/num"
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
    fingerprint,
    development: config.development
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

  async getSignQueue(submitType) {
    return signQueue(submitType)
  }

  async cancel({ userAddress, networkId }, submitType) {
    return await cancelSign(submitType, {
      address: userAddress,
      network: networkId
    })
  }

  async simulateTxAPI({ network, userAddress }, type, txProps, memo) {
    const txPayload = {
      simulate: true,
      networkId: network.id,
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
    { userAddress, network, rewards, chainId, account },
    type,
    memo,
    transactionProperties,
    txMetaData
  ) {
    const {
      gasEstimate,
      gasPrice,
      submitType,
      password,
      displayedProperties
    } = txMetaData
    const signer = await getSigner(config, submitType, {
      address: userAddress,
      password,
      network: network.id,
      networkType: network.network_type,
      displayedProperties
    })

    const messageMetadata = {
      gas: String(gasEstimate),
      gasPrices: convertCurrencyData([gasPrice], network),
      memo
    }

    let txMessages = []
    if (type === transaction.WITHDRAW) {
      const validators = getTop5RewardsValidators(rewards)
      await Promise.all(
        validators.map(async validator => {
          const txMessage = await getMessage(network.id, type, userAddress, {
            validatorAddress: validator
          })
          txMessages.push(txMessage)
        })
      )
    } else {
      const txMessage = await getMessage(
        network.id,
        type,
        userAddress,
        transactionProperties
      )
      txMessages.push(txMessage)
    }

    const createSignedTransaction = await getSignedTransactionCreator(
      network.network_type
    )
    const signedMessage = await createSignedTransaction(
      messageMetadata,
      txMessages,
      signer,
      chainId,
      account ? account.accountNumber : null,
      account ? account.sequence : null
    )

    const txPayload = {
      simulate: false,
      messageType: type,
      networkId: network.id,
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

function convertCurrencyData(amounts, network) {
  return amounts.map(({ amount, denom }) => ({
    amount: toMicroUnit(amount, denom, network),
    denom: toMicroDenom(denom)
  }))
}

// limitation of the Ledger Nano S, so we pick the top 5 rewards and inform the user.
export function getTop5RewardsValidators(rewards) {
  const rewardsPerValidatorObject = rewards.reduce((all, reward) => {
    return {
      ...all,
      [reward.validator.operatorAddress]:
        Number(reward.amount) +
        (Number(all[reward.validator.operatorAddress]) || 0)
    }
  }, {})
  const rewardsPerValidatorAddresses = Object.keys(rewardsPerValidatorObject)
  let rewardsPerValidatorArray = []
  rewardsPerValidatorAddresses.forEach((validatorAddress, index) => {
    rewardsPerValidatorArray.push({
      validator: validatorAddress,
      totalRewardAmount: Object.values(rewardsPerValidatorObject)[index]
    })
  })
  return rewardsPerValidatorArray
    .sort((a, b) => b.totalRewardAmount - a.totalRewardAmount)
    .slice(0, 5)
    .map(rewardPerValidator => rewardPerValidator.validator)
}
