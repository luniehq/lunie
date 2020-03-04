const { ApiPromise, WsProvider } = require('@polkadot/api')
const BigNumber = require('bignumber.js')

class polkadotAPI {
  constructor(network) {
    this.network = network
    this.setReducers()
  }

  setReducers() {
    this.reducers = require('../reducers/polkadotV0-reducers')
  }

  async getAPIPromise() {
    return await ApiPromise.create({
      provider: new WsProvider(this.network.rpc_url)
    })
  }

  async getBlockByHeight(blockHeight) {
    const api = await this.getAPIPromise()

    const [blockHash, sessionIndex] = await Promise.all([
      api.rpc.chain.getBlockHash(blockHeight),
      api.query.babe.epochIndex()
    ])

    const [{ author }, blockEvents] = await Promise.all([
      api.derive.chain.getHeader(blockHash),
      api.query.system.events.at(blockHash)
    ])

    api.disconnect()

    return this.reducers.blockReducer(
      this.networkId,
      blockHeight,
      blockHash,
      sessionIndex.toNumber(),
      author,
      blockEvents
    )
  }

  extractInvolvedAddresses(blockEvents) {
    let involvedAddresses = []
    blockEvents.forEach(async record => {
      const { event } = record

      // event.section  balances
      // event.method   NewAccount
      // event.data     ["FNtKsMaSWe2UAatJjnCkikEJsiQYDqTcB4ujUebs51KRE1V",100000000000]

      if (event.section === `balances` && event.method === `NewAccount`) {
        console.log(`Involved address:`, event.data[0])
        involvedAddresses.push(event.data[0])
      }

      // event.section  balances
      // event.method   Deposit
      // event.data     ["D948vxMSA6u7G5gqPGQdAUDMJbiR7wgqZ1La8XeBiXr9FTF",2000000000]

      if (event.section === `balances` && event.method === `Deposit`) {
        console.log(`Involved address:`, event.data[0])
        involvedAddresses.push(event.data[0])
      }

      // event.section  balances
      // event.method   ReapedAccount
      // event.data     ["GksmapjLhJBS4vA7JBT6oMbc98YLGheR9qmTHDkeo4F9koh",0]

      if (event.section === `balances` && event.method === `ReapedAccount`) {
        console.log(`Involved address:`, event.data[0])
        involvedAddresses.push(event.data[0])
      }

      // event.section  balances
      // event.method   Transfer
      // event.data     ["GksmapjLhJBS4vA7JBT6oMbc98YLGheR9qmTHDkeo4F9koh","GwoksmaSpMdDwxxRYV9P4BwCcF1agXNWjdxSF2oEWwEc1iy",60000000000,10000000000]

      if (event.section === `balances` && event.method === `ReapedAccount`) {
        console.log(`Involved address:`, event.data[0])
        involvedAddresses.push(event.data[0])
        console.log(`Involved address:`, event.data[1])
        involvedAddresses.push(event.data[1])
      }

      // console.log(
      //   `\x1b[36mNew kusama extrinsic for block #${blockHeight} index: ${index} section: ${
      //     event.section
      //   } method: ${
      //     event.method
      //   } phase: ${phase.toString()} data: ${JSON.stringify(
      //     event.data
      //   )}\x1b[0m`
      // )
    })
    return involvedAddresses
  }

  async getAllValidators() {
    const api = await this.getAPIPromise()

    // Fetch validator addresses for current session
    const validatorAddresses = await api.query.session.validators()

    // Fetch validator's staking info
    let validators = await Promise.all(
      validatorAddresses.map(authorityId =>
        api.derive.staking.account(authorityId)
      )
    )
    validators = JSON.parse(JSON.stringify(validators))

    // Calculate and update total active staked funds
    let networkTotalStake = new BigNumber(0)
    validators.forEach(validator => {
      if (validator.exposure) {
        const accum = new BigNumber(validator.exposure.total)
        networkTotalStake = networkTotalStake.plus(accum)
      }
    })

    // Fetch identity info
    let validatorIdentity = await Promise.all(
      validatorAddresses.map(authorityId =>
        api.derive.accounts.info(authorityId)
      )
    )
    validatorIdentity = JSON.parse(JSON.stringify(validatorIdentity))

    // Add identity, voting power and tokens
    // TODO: also include self stake
    validators.forEach(validator => {
      const identity = validatorIdentity.find(
        validatorIdentity => validatorIdentity.accountId === validator.accountId
      )
      validator.identity = JSON.parse(JSON.stringify(identity.identity))
      if (validator.exposure) {
        const validatorStake = new BigNumber(validator.exposure.total)
        validator.votingPower = validatorStake.div(networkTotalStake).toNumber()
        validator.tokens = validatorStake / 1e12 // IMPROVE IT! Add denom decimal places to network.js
      } else {
        validator.votingPower = 0
      }
    })

    api.disconnect()

    return validators.map(validator =>
      this.reducers.validatorReducer(this.network, validator)
    )
  }

  // TODO: implement!
  async getExpectedReturns() {
    return 0
  }
}

module.exports = polkadotAPI
