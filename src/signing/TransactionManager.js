import config from "src/../config"
import { getSigner, cancelSign, signQueue } from "./signer"
import { getGraphqlHost } from "scripts/url"
import { getFingerprint } from "scripts/fingerprint"
import { getMessage } from "./MessageConstructor.js"
import gql from "graphql-tag"

const txFetchOptions = fingerprint => ({
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    fingerprint
  }
})

export default class TransactionManager {
  constructor(apolloClient) {
    this.apollo = apolloClient
  }

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

  async getCosmosTransactionData({
    memo,
    gasEstimate,
    gasPrice,
    senderAddress,
    network
  }) {
    const {
      data: {
        signingInfo: { accountNumber, sequence }
      }
    } = await this.apollo.query({
      query: gql`
        query signingInfo($networkId: String!, $senderAddress: String!) {
          overview(networkId: $networkId, address: $senderAddress) {
            accountInformation {
              accountNumber
              sequence
            }
          }
        }
      `,
      variables: { networkId: network.id, senderAddress },
      fetchPolicy: "network-only"
    })
    const { Coin } = await import("./networkMessages/cosmos-hub-mainnet")

    return {
      accountNumber,
      sequence,
      chainId: network.chain_id,
      gasEstimate: String(gasEstimate),
      gasPrices: [Coin(gasPrice, network.coinLookup)],
      memo
    }
  }

  async createSignBroadcast({
    messageType,
    message,
    transactionData,
    senderAddress,
    network,
    signingType,
    password
  }) {
    const signer = await getSigner(
      signingType,
      {
        address: senderAddress,
        password,
        network: network.id,
        networkType: network.network_type
      },
      config // only needed for Ledger
    )

    const broadcastableObject = await createAndSign(
      message,
      transactionData,
      senderAddress,
      network,
      signer
    )

    return broadcastTransaction(
      broadcastableObject,
      messageType,
      network,
      senderAddress
    )
  }
}

async function createAndSign(
  messageType,
  message,
  transactionData,
  senderAddress,
  network,
  signer
) {
  const messages = await getMessage(
    messageType,
    network,
    message,
    senderAddress,
    message
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

  return broadcastableObject
}

async function broadcastTransaction(
  broadcastableObject,
  messageType,
  network,
  senderAddress
) {
  const txPayload = {
    simulate: false,
    messageType,
    networkId: network.id,
    senderAddress: senderAddress,
    signedMessage: broadcastableObject
  }
  const result = await this.transactionAPIRequest(txPayload)
  if (result.success) {
    return { hash: result.hash }
  } else {
    throw Error("Broadcast was not successful: " + result.error)
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
