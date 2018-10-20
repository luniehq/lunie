"use strict"
const b32 = require(`../scripts/b32.js`)
const { getHeight } = require(`./rpcWrapperMock.js`)

const botAddress = `cosmos1p6zajjw6xged056andyhn62lm7axwzyspkzjq0`
const addresses = [
  `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
  `cosmos1pxdf0lvq5jvl9uxznklgc5gxuwzpdy5ynem546`,
  botAddress
]
const validators = [
  `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw`,
  `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au`,
  `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctgurrg7n`
]
let state = {
  keys: [
    {
      name: `default`,
      password: `1234567890`,
      address: addresses[0]
    }
  ],
  accounts: {
    [addresses[0]]: {
      coins: [
        {
          denom: `mycoin`,
          amount: `1000`
        },
        {
          denom: `fermion`,
          amount: `2300`
        },
        {
          denom: `steak`,
          amount: `1000`
        }
      ],
      sequence: `1`,
      account_number: `1`
    }
  },
  nonces: { [addresses[0]]: 0 },
  txs: [
    {
      tx: {
        value: {
          msg: [
            {
              type: `cosmos-sdk/Send`,
              value: {
                inputs: [
                  {
                    coins: [
                      {
                        denom: `jbcoins`,
                        amount: `1234`
                      }
                    ],
                    address: makeHash()
                  }
                ],
                outputs: [
                  {
                    coins: [
                      {
                        denom: `jbcoins`,
                        amount: `1234`
                      }
                    ],
                    address: addresses[0]
                  }
                ]
              }
            }
          ]
        }
      },
      hash: `999ADECC2DE8C3AC2FD4F45E5E1081747BBE504A`,
      height: 1
    },
    {
      tx: {
        value: {
          msg: [
            {
              type: `cosmos-sdk/Send`,
              value: {
                inputs: [
                  {
                    coins: [
                      {
                        denom: `fabocoins`,
                        amount: `1234`
                      }
                    ],
                    address: addresses[0]
                  }
                ],
                outputs: [
                  {
                    coins: [
                      {
                        denom: `fabocoins`,
                        amount: `1234`
                      }
                    ],
                    address: makeHash()
                  }
                ]
              }
            }
          ]
        }
      },
      hash: `A7C6DE5CA923AF08E6088F1348047F16BABB9F48`,
      height: 150
    }
  ],
  stake: {
    [addresses[0]]: {
      delegations: [
        {
          delegator_addr: addresses[0],
          validator_addr: validators[0],
          shares: `140000000000`,
          height: 123
        }
      ],
      unbonding_delegations: []
    }
  },
  candidates: [
    {
      operator_address: validators[0],
      pub_key: `cosmosvalpub1234`,
      revoked: false,
      tokens: `140000000000`,
      delegator_shares: `140000000000`,
      description: {
        website: `www.monty.ca`,
        details: `Mr Mounty`,
        moniker: `mr_mounty`,
        country: `Canada`
      },
      status: 2,
      bond_height: `0`,
      bond_intra_tx_counter: 6,
      proposer_reward_pool: null,
      commission: {
        rate: `0`,
        max_rate: `0`,
        max_change_rate: `0`,
        update_time: `1970-01-01T00:00:00Z`
      },
      prev_bonded_shares: `0`
    },
    {
      operator_address: validators[1],
      pub_key: `cosmosvalpub5678`,
      revoked: false,
      tokens: `0`,
      delegator_shares: `0`,
      description: {
        website: `www.greg.com`,
        details: `Good Guy Greg`,
        moniker: `good_greg`,
        country: `USA`
      },
      status: 2,
      bond_height: `0`,
      bond_intra_tx_counter: 6,
      proposer_reward_pool: null,
      commission: {
        rate: `0`,
        max_rate: `0`,
        max_change_rate: `0`,
        update_time: `1970-01-01T00:00:00Z`
      },
      prev_bonded_shares: `0`
    },
    {
      operator_address: validators[2],
      pub_key: `cosmosvalpub8910`,
      tokens: `190000000000`,
      delegator_shares: `190000000000`,
      description: {
        details: `Herr Schmidt`,
        website: `www.schmidt.de`,
        moniker: `herr_schmidt_revoked`,
        country: `DE`
      },
      revoked: true,
      status: 2,
      bond_height: `0`,
      bond_intra_tx_counter: 6,
      proposer_reward_pool: null,
      commission: {
        rate: `0`,
        max_rate: `0`,
        max_change_rate: `0`,
        update_time: `1970-01-01T00:00:00Z`
      },
      prev_bonded_shares: `0`
    }
  ],
  pool: {
    loose_tokens: 0,
    bonded_tokens: 0,
    inflation_last_time: `1970-01-01 01:00:00 +0100 CET`,
    inflation: `700000000`,
    date_last_commission_reset: 0,
    prev_bonded_shares: 0
  },
  parameters: {
    inflation_max: `20000000000`,
    inflation_min: `700000000`,
    goal_bonded: `6700000000`,
    unbonding_time: `72h0m0s`,
    max_validators: 100,
    bond_denom: `steak`
  },
  sendHeight: 2,
  signing_info: {
    start_height: 2,
    index_offset: 1,
    jailed_until: `1970-01-01T00:00:00Z`,
    signed_blocks_counter: 1
  },
  proposals: [
    {
      proposal_id: `1`,
      proposal_type: `Text`,
      title: `Proposal Title`,
      description: `Proposal description`,
      initial_deposit: [
        {
          denom: `stake`,
          amount: `100`
        }
      ],
      total_deposit: [
        {
          denom: `stake`,
          amount: `100`
        }
      ],
      submit_block: `120`,
      voting_start_block: `135`,
      proposal_status: `Passed`,
      tally_result: {
        yes: `500`,
        no: `25`,
        no_with_veto: `10`,
        abstain: `56`
      }
    },
    {
      proposal_id: `5`,
      proposal_type: `Text`,
      title: `Custom text proposal`,
      description: `custom text proposal description`,
      initial_deposit: [
        {
          denom: `stake`,
          amount: `15`
        }
      ],
      total_deposit: [
        {
          denom: `stake`,
          amount: `15`
        }
      ],
      submit_block: `10`,
      voting_start_block: `-1`,
      proposal_status: `DepositPeriod`,
      tally_result: {
        yes: `0`,
        no: `0`,
        no_with_veto: `0`,
        abstain: `0`
      }
    }
  ],
  votes: {
    1: [
      {
        proposal_id: `1`,
        voter: validators[0],
        option: `yes`
      },
      {
        proposal_id: `1`,
        voter: validators[1],
        option: `no_with_veto`
      }
    ],
    5: [
      {
        proposal_id: `5`,
        voter: validators[0],
        option: `no`
      },
      {
        proposal_id: `5`,
        voter: validators[1],
        option: `abstain`
      }
    ]
  },
  deposits: {
    1: [
      {
        proposal_id: `1`,
        depositer: validators[0],
        amount: {
          denom: `stake`,
          amount: `15`
        }
      },
      {
        proposal_id: `1`,
        depositer: validators[1],
        amount: {
          denom: `stake`,
          amount: `5`
        }
      }
    ],
    5: [
      {
        proposal_id: `5`,
        depositer: validators[0],
        amount: {
          denom: `stake`,
          amount: `11`
        }
      },
      {
        proposal_id: `5`,
        depositer: validators[1],
        amount: {
          denom: `stake`,
          amount: `150`
        }
      }
    ]
  }
}

const keys = {
  add: async ({ name, password, seed }) => {
    let key = {
      name,
      password,
      address: makeHash()
    }
    state.keys.push(key)
    return { name, password, seed, address: key.address }
  },

  delete: async (account, { name, password }) => {
    let key = state.keys.find(k => k.name === name)
    if (key.password !== password) {
      throw new Error(`Passwords do not match`)
    }
    state.keys = state.keys.filter(k => k.name !== name)
  },

  get: async name => state.keys.find(k => k.name === name),

  seed: () =>
    `blossom pool issue kidney elevator blame furnace winter account merry vessel security depend exact travel bargain problem jelly rural net again mask roast chest`,

  set: async (account, { name, old_password, new_password }) => {
    // eslint-disable-line camelcase
    let key = state.keys.find(k => k.name === name)
    if (key.password !== old_password) {
      // eslint-disable-line camelcase
      throw new Error(`Passwords do not match`)
    }
    key.password = new_password // eslint-disable-line camelcase
  },

  values: async () =>
    state.keys.map(k => ({
      name: k.name,
      address: k.address
    }))
}

module.exports = {
  candidates: state.candidates,

  async lcdConnected() {
    return true
  },

  keys,

  // coins
  async queryAccount(address) {
    return state.accounts[address]
  },
  async txs(address) {
    return state.txs.filter(tx => {
      return (
        tx.tx.value.msg[0].value.inputs.find(
          input => input.address === address
        ) ||
        tx.tx.value.msg[0].value.outputs.find(
          output => output.address === address
        )
      )
    })
  },
  async tx(hash) {
    return state.txs.find(tx => tx.hash === hash)
  },
  async send(to, req) {
    let fromKey = state.keys.find(a => a.name === req.base_req.name)
    if (!fromKey)
      throw Error(
        `Key you want to send from does not exist in the lcd connection mock`
      )
    return send(to, fromKey.address, req)
  },

  // staking
  async updateDelegations(
    delegatorAddr,
    {
      base_req: { name, sequence },
      delegations = [],
      begin_unbondings = [],
      complete_unbondings = []
    }
  ) {
    let results = []
    let fromKey = state.keys.find(a => a.name === name)
    let fromAccount = state.accounts[fromKey.address]
    let delegator = state.stake[fromKey.address]
    if (fromAccount == null) {
      results.push(txResult(1, `Nonexistent account`))
      return results
    }
    // check nonce
    if (parseInt(fromAccount.sequence) !== parseInt(sequence)) {
      results.push(
        txResult(
          2,
          `Expected sequence "${fromAccount.sequence}", got "${sequence}"`
        )
      )
      return results
    }
    for (let tx of delegations) {
      let { denom } = tx.delegation
      let amount = parseInt(tx.delegation.amount)
      if (amount < 0) {
        results.push(txResult(1, `Amount cannot be negative`))
        return results
      }
      if (fromAccount.coins.find(c => c.denom === denom).amount < amount) {
        results.push(txResult(1, `Not enough coins in your account`))
        return results
      }
      // update sender account
      incrementSequence(fromAccount)
      fromAccount.coins.find(c => c.denom === denom).amount -= amount

      // update stake
      if (!delegator) {
        state.stake[fromKey.address] = {
          delegations: [],
          unbonding_delegations: []
        }
        delegator = state.stake[fromKey.address]
      }
      let delegation = delegator.delegations.find(
        d => d.validator_addr === tx.validator_addr
      )
      if (!delegation) {
        delegation = {
          delegator_addr: fromKey.address,
          validator_addr: tx.validator_addr,
          shares: `0`,
          height: 0
        }
        delegator.delegations.push(delegation)
      }

      // TODO remove after sdk.Dec parsing is fixed
      amount = amount * 10000000000

      let shares = parseInt(delegation.shares)
      delegation.shares = (shares + amount).toString()
      let candidate = state.candidates.find(
        c => c.operator_address === tx.validator_addr
      )
      if (candidate.revoked) {
        throw new Error(`checkTx failed: (262245) Msg 0 failed: === ABCI Log ===
  Codespace: 4
  Code:      101
  ABCICode:  262245
  Error:     --= Error =--
  Data: common.FmtError{format:"validator for this address is currently revoked", args:[]interface {}(nil)}
  Msg Traces:
  --= /Error =--

  === /ABCI Log ===`)
      }

      candidate.tokens = (parseInt(candidate.tokens) + amount).toString()
      candidate.delegator_shares = (
        parseInt(candidate.delegator_shares) + amount
      ).toString()

      storeTx(`cosmos-sdk/MsgDelegate`, tx)
      results.push(txResult(0))
    }

    for (let tx of begin_unbondings) {
      incrementSequence(fromAccount)

      let amount = parseInt(tx.shares)

      // update sender balance
      let coinBalance = fromAccount.coins.find(c => c.denom === `steak`)
      coinBalance.amount = String(parseInt(coinBalance) + amount)

      // update stake
      if (!delegator) {
        results.push(txResult(2, `Nonexistent delegator`))
        return results
      }
      let delegation = delegator.delegations.find(
        d => d.validator_addr === tx.validator_addr
      )
      if (!delegation) {
        results.push(txResult(2, `Nonexistent delegation`))
        return results
      }

      // TODO remove after sdk.Dec parsing is fixed
      amount = amount * 10000000000

      let shares = parseInt(delegation.shares)
      delegation.shares = (+shares - amount).toString()

      let candidate = state.candidates.find(
        c => c.operator_address === tx.validator_addr
      )
      shares = parseInt(candidate.tokens)
      candidate.tokens = (+shares - amount).toString()
      delegator.unbonding_delegations.push(
        Object.assign({}, tx, {
          balance: {
            amount: tx.shares
          }
        })
      )

      storeTx(`cosmos-sdk/BeginUnbonding`, tx)
      results.push(txResult(0))
    }

    for (let tx of complete_unbondings) {
      incrementSequence(fromAccount)

      if (!delegator) {
        results.push(txResult(2, `Nonexistent delegator`))
        return results
      }

      // remove undelegation
      let unbondingDelegation = delegator.unbonding_delegations.find(
        ({ validator_addr }) => validator_addr === tx.validator_addr
      )
      delegator.unbonding_delegations = delegator.unbonding_delegations.filter(
        d => d !== unbondingDelegation
      )

      // put money back in the account
      // we treat shares as atoms (1:1)
      let amount = unbondingDelegation.shares

      // update sender balance
      let coinBalance = fromAccount.coins.find(c => c.denom === `steak`)
      coinBalance.amount = String(parseInt(coinBalance) + amount)

      storeTx(`cosmos-sdk/CompleteUnbonding`, tx)
      results.push(txResult(0))
    }

    return results
  },
  async queryDelegation(delegatorAddress, validatorAddress) {
    let delegator = state.stake[delegatorAddress]
    if (!delegator)
      return {
        shares: `0`
      }
    return delegator.delegations.find(
      ({ validator_addr }) => validator_addr === validatorAddress
    )
  },
  async queryUnbonding(delegatorAddress, validatorAddress) {
    let delegator = state.stake[delegatorAddress]
    if (!delegator) return
    return delegator.unbonding_delegations.find(
      d => d.validator_addr === validatorAddress
    )
  },
  // Get all delegations information from a delegator
  getDelegator(delegatorAddress) {
    let delegator = state.stake[delegatorAddress] || {}
    return delegator
  },
  getDelegatorTxs(addr, types = []) {
    if (types.length === 0) types = [`bonding`, `unbonding`]
    types = types.map(type => {
      if (type === `bonding`) return `cosmos-sdk/MsgDelegate`
      if (type === `unbonding`) return `cosmos-sdk/BeginUnbonding`
    })
    return getTxs(types)
  },
  async getCandidates() {
    return state.candidates
  },
  async getValidatorSet() {
    return {
      block_height: 1,
      validators: state.candidates
    }
  },
  async getCandidate(addr) {
    return state.candidates.find(c => c.operator_address === addr)
  },
  // TODO query with bech32 pubKey
  async queryValidatorSigningInfo() {
    return state.signing_info
  },
  async getPool() {
    return state.pool
  },
  async getParameters() {
    return state.parameters
  },
  async getProposals() {
    return state.proposals
  },
  async getProposal(proposalId) {
    return state.proposals.find(
      proposal => proposal.proposal_id === String(proposalId)
    )
  },
  async getProposalDeposits(proposalId) {
    return state.deposits[proposalId]
  },
  async getProposalDeposit(proposalId, address) {
    return state.deposits[proposalId].find(
      deposit => deposit.depositer === address
    )
  },
  async getProposalVotes(proposalId) {
    return state.votes[proposalId]
  },
  async getProposalVote(proposalId, address) {
    return state.votes[proposalId].find(vote => vote.voter === address)
  },
  // exports to be used in tests
  state,
  addresses,
  validators
}

function makeHash() {
  var text = ``
  var possible = `ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789`

  for (var i = 0; i < 40; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return b32.encode(text)
}

function send(to, from, req) {
  let fromAccount = state.accounts[from]
  if (fromAccount == null) {
    return txResult(1, `Nonexistent account`)
  }

  for (let { denom, amount } of req.amount) {
    if (parseInt(amount) < 0) {
      return txResult(1, `Amount cannot be negative`)
    }
    let coins = fromAccount.coins.find(c => c.denom === denom)
    if (!coins || coins.amount < parseInt(amount)) {
      return txResult(1, `Not enough coins in your account`)
    }
  }

  // check/update nonce
  if (parseInt(fromAccount.sequence) !== parseInt(req.base_req.sequence)) {
    return txResult(
      2,
      `Expected sequence "${fromAccount.sequence}", got "${
        req.base_req.sequence
      }"`
    )
  }
  incrementSequence(fromAccount)

  // update sender balances
  for (let { denom, amount } of req.amount) {
    let senderBalance = fromAccount.coins.find(c => c.denom === denom)
    senderBalance.amount = String(
      parseInt(senderBalance.amount) - parseInt(amount)
    )
  }

  // update receiver balances
  let receiverAccount = state.accounts[to]
  if (!receiverAccount) {
    receiverAccount = state.accounts[to] = {
      coins: [],
      sequence: `0`
    }
  }
  for (let { denom, amount } of req.amount) {
    let receiverBalance = receiverAccount.coins.find(c => c.denom === denom)
    if (!receiverBalance) {
      receiverBalance = { amount: `0`, denom }
      receiverAccount.coins.push(receiverBalance)
    }
    receiverBalance.amount = String(
      parseInt(receiverBalance.amount) + parseInt(amount)
    )
  }

  // log tx
  storeTx(`cosmos-sdk/Send`, {
    inputs: [
      {
        coins: req.amount,
        address: from
      }
    ],
    outputs: [
      {
        coins: req.amount,
        address: to
      }
    ]
  })

  // if receiver is bot address, send money back
  if (to === botAddress) {
    send(from, botAddress, {
      amount: req.amount,
      sequence: state.accounts[botAddress].sequence
    })
  }

  return txResult(0)
}

function storeTx(type, body) {
  state.txs.push({
    tx: {
      value: {
        msg: [
          {
            type,
            value: body
          }
        ]
      }
    },
    hash: makeHash(),
    height: getHeight(),
    time: Date.now()
  })
}

function getTxs(types) {
  return state.txs.filter(tx => types.indexOf(tx.tx.value.msg[0].type) !== -1)
}

// function delegate (sender, { pub_key: { data: pubKey }, amount: delegation }) {
//   let delegate = state.delegates.find(d => d.pub_key.data === pubKey)
//   if (!delegate) {
//     return txResult(1, 'Delegator does not exist')
//   }
//
//   let fermions = state.accounts[sender].coins.find(c => c.denom === 'fermion')
//   if (!fermions) {
//     state.accounts[sender].coins.push({ denom: 'fermion', amount: 0 })
//     fermions = state.accounts[sender].coins.find(c => c.denom === 'fermion')
//   }
//   if (fermions.amount < delegation.amount) {
//     return txResult(1, 'Not enought fermions to stake')
//   }
//
//   // execute
//   fermions.amount -= delegation.amount
//   delegate.voting_power += delegation.amount
//   state.stake[sender][pubKey] = state.stake[sender][pubKey] || {
//     PubKey: { data: pubKey },
//     Shares: 0
//   }
//   state.stake[sender][pubKey].Shares += delegation.amount
//
//   return txResult()
// }

function txResult(code = 0, message = ``) {
  return {
    check_tx: {
      code: code,
      data: ``,
      log: message,
      gas: `0`,
      fee: `0`
    },
    deliver_tx: {
      code: 0,
      data: ``,
      log: ``,
      tags: []
    },
    hash: `999ADECC2DE8C3AC2FD4F45E5E1081747BBE504A`,
    height: 0
  }
}

function incrementSequence(account) {
  account.sequence = (parseInt(account.sequence) + 1).toString()
}
