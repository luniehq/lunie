import config from "src/../config"
import { getSigner, cancelSign, signQueue } from "./signer"
import { getGraphqlHost } from "scripts/url"
import { getFingerprint } from "scripts/fingerprint"
import { getMessage } from "./MessageConstructor.js"

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
    { userAddress, network, chainId, account },
    type,
    memo,
    transactionProperties,
    txMetaData
  ) {
    const { Coin } = await import("./networkMessages/cosmos-hub-mainnet")
    const {
      gasEstimate,
      gasPrice,
      submitType,
      password,
      displayedProperties
    } = txMetaData
    const signer = await getSigner(
      submitType,
      {
        address: userAddress,
        password,
        network: network.id,
        networkType: network.network_type,
        displayedProperties
      },
      config
    )

    // only for Cosmos
    const transactionData = {
      gas: String(gasEstimate),
      gasPrices: [Coin(gasPrice, network.coinLookup)],
      memo,
      chainId,
      sequence: account && account.sequence,
      accountNumber: account && account.accountNumber
    }

    const messages = await getMessage(
      network,
      type,
      userAddress,
      transactionProperties
    )

    const { getSignableObject, getBroadcastableObject } = await import(
      `./${network.network_type}-signing.js`
    )
    const signableObject = await getSignableObject(messages, transactionData)
    const signedContext = await signer(signableObject)
    const broadcastableObject = await getBroadcastableObject(
      messages,
      transactionData,
      signedContext
    )

    const txPayload = {
      simulate: false,
      messageType: type,
      networkId: network.id,
      senderAddress: userAddress,
      signedMessage: broadcastableObject
    }
    const result = await this.transactionAPIRequest(txPayload)
    if (result.success) {
      return { hash: result.hash }
    } else {
      throw Error("Broadcast was not successful: " + result.error)
    }
  }
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
