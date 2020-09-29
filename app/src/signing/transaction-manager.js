import config from "src/../config"
import { getSigner, cancelSign, signQueue } from "./signer"
import { getGraphqlHost } from "scripts/url"
import { getFingerprint } from "scripts/fingerprint"
import { getMessage } from "./message-creator.js"
import { signWithExtension } from "scripts/extension-utils"
import gql from "graphql-tag"
import BigNumber from "bignumber.js"

const txFetchOptions = (fingerprint) => ({
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    fingerprint,
    development: config.development,
  },
})

export default class TransactionManager {
  constructor(apolloClient) {
    this.apollo = apolloClient
  }

  async broadcastAPIRequest(payload) {
    const fingerprint = await getFingerprint()
    const options = {
      ...txFetchOptions(fingerprint),
      body: JSON.stringify({ payload }),
    }
    const graphqlHost = getGraphqlHost()

    return fetch(
      `${graphqlHost}/transaction/broadcast`,
      options
    ).then((result) => result.json())
  }

  async getSignQueue(submitType) {
    return signQueue(submitType)
  }

  async cancel({ userAddress, networkId }, submitType) {
    return await cancelSign(submitType, {
      address: userAddress,
      network: networkId,
    })
  }

  async getCosmosTransactionData({
    memo,
    gasEstimate,
    fee,
    senderAddress,
    network,
  }) {
    const response = await this.apollo.query({
      query: gql`
        query signingInfo($networkId: String!, $senderAddress: String!) {
          transactionMetadata(networkId: $networkId, address: $senderAddress) {
            accountNumber
            accountSequence
          }
        }
      `,
      variables: { networkId: network.id, senderAddress },
      fetchPolicy: "network-only",
    })
    const {
      data: {
        transactionMetadata: { accountNumber, accountSequence },
      },
    } = response
    const coinLookup = network.coinLookup.find(
      ({ viewDenom }) => viewDenom === fee.find(({ denom }) => denom).denom
    )
    const convertedFee = [
      {
        amount: BigNumber(fee.find(({ amount }) => amount).amount)
          .div(coinLookup.chainToViewConversionFactor)
          .toNumber(),
        denom: coinLookup.chainDenom,
      },
    ]
    return {
      accountNumber,
      accountSequence,
      chainId: network.chain_id,
      gasEstimate: String(gasEstimate),
      fee: convertedFee,
      memo,
    }
  }

  async createSignBroadcast({
    messageType,
    message,
    transactionData,
    senderAddress,
    network,
    signingType,
    password,
    polkadotAPI,
    HDPath,
    curve,
  }) {
    let broadcastableObject
    if (signingType === "extension") {
      broadcastableObject = await signWithExtension(
        messageType,
        message,
        transactionData,
        senderAddress,
        network
      )
    } else {
      broadcastableObject = await this.createAndSignLocally(
        messageType,
        message,
        transactionData,
        senderAddress,
        network,
        signingType,
        password,
        polkadotAPI,
        HDPath,
        curve
      )
    }
    return this.broadcastTransaction(
      broadcastableObject,
      messageType,
      message,
      network,
      senderAddress
    )
  }

  async createAndSignLocally(
    messageType,
    message,
    transactionData,
    senderAddress,
    network,
    signingType,
    password,
    polkadotAPI,
    HDPath,
    curve
  ) {
    const messages = await getMessage(
      network,
      messageType,
      senderAddress,
      message,
      polkadotAPI
    )
    const signer = await getSigner(
      signingType,
      {
        address: senderAddress,
        password,
        network,
        HDPath,
        curve,
      },
      config // only needed for Ledger
    )

    // TODO need to get the transaction types from db
    const { getSignableObject, getBroadcastableObject } = await import(
      `./networkMessages/${network.network_type}-transactions.js`
    )
    const signableObject = await getSignableObject(messages, transactionData)
    const signedContext = await signer(signableObject)
    const broadcastableObject = await getBroadcastableObject(
      messages,
      transactionData,
      signedContext,
      HDPath,
      curve
    )

    return broadcastableObject
  }

  async broadcastTransaction(
    broadcastableObject,
    messageType,
    message,
    network,
    senderAddress
  ) {
    const txPayload = {
      messageType,
      message,
      networkId: network.id,
      senderAddress: senderAddress,
      signedMessage: broadcastableObject,
      transaction: broadcastableObject, // to change the naming in the API as well later
    }
    const result = await this.broadcastAPIRequest(txPayload)
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
        (Number(all[reward.validator.operatorAddress]) || 0),
    }
  }, {})
  const rewardsPerValidatorAddresses = Object.keys(rewardsPerValidatorObject)
  let rewardsPerValidatorArray = []
  rewardsPerValidatorAddresses.forEach((validatorAddress, index) => {
    rewardsPerValidatorArray.push({
      validator: validatorAddress,
      totalRewardAmount: Object.values(rewardsPerValidatorObject)[index],
    })
  })
  return rewardsPerValidatorArray
    .sort((a, b) => b.totalRewardAmount - a.totalRewardAmount)
    .slice(0, 5)
    .map((rewardPerValidator) => rewardPerValidator.validator)
}
