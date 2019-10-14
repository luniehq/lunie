const { RESTDataSource } = require('apollo-datasource-rest')
const BigNumber = require('bignumber.js')
const _ = require('lodash')
const chainpubsub = require('./chain-pubsub')
const {
  proposalReducer,
  validatorReducer,
  blockReducer,
  delegationReducer,
  coinReducer,
  transactionReducer,
  undelegationReducer
} = require('./reducers/cosmos-reducers')

class CosmosAPI extends RESTDataSource {
  constructor(network) {
    super()
    this.baseURL = network.api_url
    this.initialize({})
    this.subscribeToBlocks(network)
  }

  // subscribe to blocks via Tendermint
  async subscribeToBlocks(network) {
    this.wsClient = await chainpubsub.client(network.rpc_url)
    this.wsClient.subscribe({ query: "tm.event='NewBlock'" }, async event => {
      const block = await this.getBlockByHeight({
        blockHeight: event.block.header.height
      })
      chainpubsub.publishBlockAdded(network.id, block)
    })
  }

  async getValidatorSigningInfo(validatorConsensusPubKey) {
    try {
      const exceptions = [
        `cosmosvalconspub1zcjduepqx38v580cmd9em3n7mcgzj22jwdwks5lr3lfxl8g87vzjp7jyyszsr4xvzv`,
        `cosmosvalconspub1zcjduepqlzmd0spn9m0m3eq9zp93d4w6e5tugamv44yqjzyacelnvra634fqnfec0r`
      ]
      if (exceptions.indexOf(validatorConsensusPubKey) !== -1) {
        console.log(`Ignore Validator ${validatorConsensusPubKey}`)
        throw Error()
      }
      const response = await this.get(
        `slashing/validators/${validatorConsensusPubKey}/signing_info`
      )
      return response
    } catch (e) {
      return {
        missed_blocks_counter: '0',
        start_height: '0'
      }
    }
  }

  async getAllValidatorSets() {
    const response = await this.get(`validatorsets/latest`)
    return response
  }

  async getAllValidators() {
    const response = await Promise.all([
      this.get(`staking/validators?status=unbonding`),
      this.get(`staking/validators?status=bonded`),
      this.get(`staking/validators?status=unbonded`)
    ]).then(validatorGroups => [].concat(...validatorGroups))

    const validatorSet = await this.getAllValidatorSets()

    validatorSet.validators.forEach(votingValidator => {
      const validator = response.find(
        v => v.consensus_pubkey === votingValidator.pub_key
      )
      validator.voting_power = validator ? votingValidator.voting_power : 0
    })

    await Promise.all(
      response.map(validator =>
        this.getValidatorSigningInfo(validator.consensus_pubkey)
      )
    ).then(singingInfos => {
      singingInfos.forEach((signingInfo, index) => {
        response[index].signing_info = signingInfo
      })
    })

    return Array.isArray(response)
      ? response.map(validator => validatorReducer(validator))
      : []
  }

  async getValidatorByAddress(operatorAddress) {
    const response = await this.get(`staking/validators/${operatorAddress}`)
    const signingInfo = await this.getValidatorSigningInfo(
      response.consensus_pubkey
    )
    response.signing_info = signingInfo
    return validatorReducer(response)
  }

  async getAllProposals() {
    const response = await this.get('gov/proposals')
    const { bonded_tokens: totalBondedTokens } = await this.get('/staking/pool')
    if (!Array.isArray(response)) return []
    const proposals = await Promise.all(
      response.map(async proposal => {
        return proposalReducer(proposal, totalBondedTokens)
      })
    )
    return _.orderBy(proposals, 'id', 'desc')
  }

  async getProposalById({ proposalId }) {
    const response = await this.get(`gov/proposals/${proposalId}`)
    const { bonded_tokens: totalBondedTokens } = await this.get('/staking/pool')
    return proposalReducer(response, totalBondedTokens)
  }

  async getGovernanceParameters() {
    const depositParameters = await this.get(`gov/parameters/deposit`)
    const tallyingParamers = await this.get(`gov/parameters/tallying`)
    return {
      votingThreshold: tallyingParamers.threshold,
      vetoThreshold: tallyingParamers.veto,
      // for now assuming one deposit denom
      depositDenom: 'ATOM',
      depositThreshold: BigNumber(depositParameters.min_deposit[0].amount).div(
        1000000
      )
    }
  }

  async getDelegatorVote({ proposalId, address }) {
    const response = await this.get(`gov/proposals/${proposalId}/votes`)
    const votes = response || []
    const vote = votes.find(({ voter }) => voter === address) || {}
    return {
      option: vote.option
    }
  }

  async getBlockByHeight({ blockHeight }) {
    let response
    if (blockHeight) {
      response = await this.get(`blocks/${blockHeight}`)
    } else {
      response = await this.get(`blocks/latest`)
    }
    return blockReducer(response)
  }

  async getBalanceFromAddress(address) {
    const response = await this.get(`bank/balances/${address}`)
    return response.map(coinReducer)
  }

  async getDelegationsForDelegatorAddress(address) {
    const response = await this.get(`staking/delegators/${address}/delegations`)
    return Array.isArray(response)
      ? response.map(delegation => delegationReducer(delegation))
      : []
  }

  async getUndelegationsForDelegatorAddress(address) {
    const response = await this.get(
      `staking/delegators/${address}/unbonding_delegations`
    )
    return Array.isArray(response)
      ? response.map(undelegation => undelegationReducer(undelegation))
      : []
  }

  async getDelegationForValidator(delegatorAddress, operatorAddress) {
    try {
      const response = await this.get(
        `staking/delegators/${delegatorAddress}/delegations/${operatorAddress}`
      )
      return delegationReducer(response)
    } catch (e) {
      return delegationReducer({ error: true })
    }
  }

  async getBondedTokens() {
    const response = await this.get(`staking/pool`)
    return response.bonded_tokens
  }

  async getAnnualProvision() {
    const response = await this.get(`minting/annual-provisions`)
    return response
  }

  async getRewards(delegatorAddress, operatorAddress) {
    let fetchURL
    if (delegatorAddress && operatorAddress) {
      fetchURL = `distribution/delegators/${delegatorAddress}/rewards/${operatorAddress}`
    } else if (delegatorAddress) {
      fetchURL = `distribution/delegators/${delegatorAddress}/rewards`
    } else if (operatorAddress) {
      fetchURL = `distribution/validators/${operatorAddress}/rewards`
    } else {
      return
    }

    try {
      const response = await this.get(fetchURL)
      return Array.isArray(response)
        ? response.map(validator => coinReducer(validator))
        : []
    } catch (e) {
      return []
    }

    // if (response.error) {
    //   return []
    // }
  }

  async getValidatorDelegations(operatorAddress) {
    const response = await this.get(
      `staking/validators/${operatorAddress}/delegations`
    )

    return Array.isArray(response)
      ? response.map(proposal => delegationReducer(proposal))
      : []
  }

  async getBankTransactions(address) {
    const txs = await Promise.all([
      this.get(`/txs?sender=${address}`),
      this.get(`/txs?recipient=${address}`)
    ]).then(([senderTxs, recipientTxs]) => [].concat(senderTxs, recipientTxs))

    return txs.map(transactionReducer)
  }
}

module.exports = CosmosAPI
