const BigNumber = require('bignumber.js')

function blockReducer(
  networkId,
  blockHeight,
  blockHash,
  sessionIndex,
  blockAuthor,
  blockEvents
) {
  return {
    networkId,
    height: blockHeight,
    chainId: `kusama-cc3`,
    hash: blockHash,
    sessionIndex,
    time: new Date().toISOString(), // TODO: Get from blockchain state
    transactions: blockEvents, // TODO: IMPROVE!
    proposer_address: blockAuthor
  }
}

function validatorReducer(network, validator) {
  return {
    networkId: network.id,
    chainId: network.chain_id,
    operatorAddress: validator.accountId,
    website:
      validator.identity.web && validator.identity.web !== ``
        ? validator.identity.web
        : ``,
    identity:
      validator.identity.display && validator.identity.display !== ``
        ? validator.identity.display
        : validator.accountId,
    name:
      validator.identity.display && validator.identity.display !== ``
        ? validator.identity.display
        : validator.accountId,
    votingPower: validator.votingPower.toFixed(9),
    startHeight: undefined,
    uptimePercentage: undefined,
    tokens: validator.tokens,
    commissionUpdateTime: undefined,
    commission: (validator.validatorPrefs.commission / 1000000000).toFixed(9), // Returns commission in 0-1 range (1 = 100%)
    maxCommission: undefined,
    maxChangeCommission: undefined,
    status: validator.status,
    statusDetailed: ``, // TODO: Include validator heartbeat messages
    delegatorShares: undefined,
    selfStake:
      (
        BigNumber(validator.exposure.own).toNumber() *
        network.coinLookup[0].chainToViewConversionFactor
      ).toFixed(9) || 0,
    nominations: validator.nominations
  }
}

function balanceReducer(network, balance, total) {
  // hack. We convert the balance into an Array to make it an Iterable
  return [
    {
      amount: BigNumber(balance)
        .times(network.coinLookup[0].chainToViewConversionFactor)
        .toFixed(4),
      total: BigNumber(total)
        .times(network.coinLookup[0].chainToViewConversionFactor)
        .toFixed(4),
      denom: network.coinLookup[0].viewDenom
    }
  ]
}

function delegationReducer(network, delegation, validator) {
  return {
    validatorAddress: validator.operatorAddress,
    delegatorAddress: delegation.who,
    validator,
    amount: BigNumber(delegation.value)
      .times(network.coinLookup[0].chainToViewConversionFactor)
      .toFixed(9)
  }
}

function extractInvolvedAddresses(blockEvents) {
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

module.exports = {
  blockReducer,
  validatorReducer,
  balanceReducer,
  delegationReducer,
  extractInvolvedAddresses
}
