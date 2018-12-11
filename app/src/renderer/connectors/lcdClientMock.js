"use strict"

const moment = require(`moment`)
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
          denom: `STAKE`,
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
                    address: addresses[1]
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
                    address: addresses[1]
                  }
                ]
              }
            }
          ]
        }
      },
      hash: `A7C6DE5CA923AF08E6088F1348047F16BABB9F48`,
      height: 150
    },
    {
      hash: `QSDFGE5CA923AF08E6088F1348047F16BAHH8K31`,
      height: 56673,
      tx: {
        type: `8EFE47F0625DE8`,
        value: {
          msg: [
            {
              type: `cosmos-sdk/MsgSubmitProposal`,
              value: {
                proposer: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
                proposal_type: `Text`,
                title: `Test Proposal`,
                description: `This is a test proposal`,
                initial_deposit: [
                  {
                    denom: `STAKE`,
                    amount: `100`
                  }
                ]
              }
            }
          ]
        }
      }
    },
    {
      hash: `QASDE5CA923AF08EEE38F1348047F16BAHH8K31`,
      height: 213,
      tx: {
        type: `8EFE47F0625DE8`,
        value: {
          msg: [
            {
              type: `cosmos-sdk/MsgDeposit`,
              value: {
                depositor: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
                proposal_id: `1`,
                amount: [
                  {
                    denom: `STAKE`,
                    amount: `100`
                  }
                ]
              }
            }
          ]
        }
      }
    },
    {
      tx: {
        value: {
          msg: [
            {
              type: `cosmos-sdk/MsgDelegate`,
              value: {
                validator_addr: validators[0],
                delegator_addr: addresses[0],
                delegation: {
                  amount: `24`,
                  denom: `STAKE`
                }
              }
            }
          ]
        }
      },
      hash: `A7C6DE5CB923AF08E6088F1348047F16BABB9F48`,
      height: 160
    },
    {
      tx: {
        value: {
          msg: [
            {
              type: `cosmos-sdk/BeginUnbonding`,
              value: {
                validator_addr: validators[0],
                delegator_addr: addresses[0],
                shares: `5`
              }
            }
          ]
        }
      },
      hash: `A7C6FDE5CA923AF08E6088F1348047F16BABB9F48`,
      height: 170
    }
  ],
  stake: {
    [addresses[0]]: {
      delegations: [
        {
          delegator_addr: addresses[0],
          validator_addr: validators[0],
          shares: `14`,
          height: 123
        }
      ],
      unbonding_delegations: [],
      redelegations: []
    }
  },
  candidates: [
    {
      operator_address: validators[0],
      pub_key: `cosmosvalpub1234`,
      revoked: false,
      tokens: `14`,
      delegator_shares: `14`,
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
      tokens: `19`,
      delegator_shares: `19`,
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
    loose_tokens: `100.0000000000`,
    bonded_tokens: `50.0000000000`
  },
  stakingParameters: {
    unbonding_time: `259200000000000`,
    max_validators: 100,
    bond_denom: `STAKE`
  },
  governanceParameters: {
    deposit: {
      min_deposit: [
        {
          denom: `stake`,
          amount: `10.0000000000`
        }
      ],
      max_deposit_period: `86400000000000`
    },
    tallying: {
      threshold: `0.5000000000`,
      veto: `0.3340000000`,
      governance_penalty: `0.0100000000`
    },
    voting: {
      voting_period: `86400000000000`
    }
  },
  sendHeight: 2,
  signing_info: {
    start_height: 2,
    index_offset: 1,
    jailed_until: `1970-01-01T00:00:00Z`,
    signed_blocks_counter: 1
  },
  proposals: {
    "1": {
      proposal_id: `1`,
      proposal_type: `Text`,
      title: `Proposal Title`,
      description: `Proposal description`,
      initial_deposit: [
        {
          denom: `STAKE`,
          amount: `100`
        }
      ],
      total_deposit: [
        {
          denom: `STAKE`,
          amount: `100`
        }
      ],
      submit_time: `2018-11-21T13:29:24.66404Z`,
      deposit_end_time: `2018-11-23T13:29:24.66404Z`,
      voting_start_time: `2018-11-23T13:29:24.66404Z`,
      voting_end_time: `2018-11-25T13:29:24.66404Z`,
      proposal_status: `Passed`,
      tally_result: {
        yes: `500`,
        no: `25`,
        no_with_veto: `10`,
        abstain: `56`
      }
    },
    "2": {
      proposal_id: `2`,
      proposal_type: `Text`,
      title: `VotingPeriod proposal`,
      description: `custom text proposal description`,
      initial_deposit: [
        {
          denom: `STAKE`,
          amount: `200`
        }
      ],
      total_deposit: [
        {
          denom: `STAKE`,
          amount: `200`
        }
      ],
      submit_time: `2018-11-21T13:29:24.66404Z`,
      deposit_end_time: `2018-11-23T13:29:24.66404Z`,
      voting_start_time: `2018-11-23T13:29:24.66404Z`,
      voting_end_time: `2018-11-25T13:29:24.66404Z`,
      proposal_status: `VotingPeriod`,
      tally_result: {
        yes: `0`,
        no: `0`,
        no_with_veto: `0`,
        abstain: `0`
      }
    },
    "5": {
      proposal_id: `5`,
      proposal_type: `Text`,
      title: `Custom text proposal`,
      description: `custom text proposal description`,
      initial_deposit: [
        {
          denom: `STAKE`,
          amount: `20`
        }
      ],
      total_deposit: [
        {
          denom: `STAKE`,
          amount: `170`
        }
      ],
      submit_time: `2018-11-21T13:29:24.66404Z`,
      deposit_end_time: `2018-11-23T13:29:24.66404Z`,
      voting_start_time: `0001-01-01T00:00:00Z`,
      voting_end_time: `0001-01-01T00:00:00Z`,
      proposal_status: `DepositPeriod`,
      tally_result: {
        yes: `0`,
        no: `0`,
        no_with_veto: `0`,
        abstain: `0`
      }
    },
    "6": {
      proposal_id: `6`,
      proposal_type: `Text`,
      title: `Rejected proposal`,
      description: `this proposal was rejected`,
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
      submit_time: `2018-11-21T13:29:24.66404Z`,
      deposit_end_time: `2018-11-23T13:29:24.66404Z`,
      voting_start_time: `2018-11-23T13:29:24.66404Z`,
      voting_end_time: `2018-11-25T13:29:24.66404Z`,
      proposal_status: `Rejected`,
      tally_result: {
        yes: `10`,
        no: `30`,
        no_with_veto: `100`,
        abstain: `20`
      }
    }
  },
  votes: {
    1: [
      {
        proposal_id: `1`,
        voter: validators[0],
        option: `Yes`
      },
      {
        proposal_id: `1`,
        voter: validators[1],
        option: `NoWithVeto`
      }
    ],
    2: [],
    5: [
      {
        proposal_id: `5`,
        voter: validators[0],
        option: `No`
      },
      {
        proposal_id: `5`,
        voter: validators[1],
        option: `Abstain`
      }
    ],
    6: [
      {
        proposal_id: `6`,
        voter: validators[0],
        option: `No`
      },
      {
        proposal_id: `6`,
        voter: validators[1],
        option: `NoWithVeto`
      }
    ]
  },
  deposits: {
    1: [
      {
        proposal_id: `1`,
        depositor: validators[0],
        amount: [
          {
            denom: `STAKE`,
            amount: `15`
          },
          {
            denom: `STAKE`,
            amount: `5`
          }
        ]
      },
      {
        proposal_id: `1`,
        depositor: validators[1],
        amount: [
          {
            denom: `STAKE`,
            amount: `5`
          }
        ]
      }
    ],
    2: [
      {
        proposal_id: `2`,
        depositor: validators[0],
        amount: [
          {
            denom: `STAKE`,
            amount: `200`
          }
        ]
      }
    ],
    5: [
      {
        proposal_id: `5`,
        depositor: validators[0],
        amount: [
          {
            denom: `STAKE`,
            amount: `20`
          }
        ]
      },
      {
        proposal_id: `5`,
        depositor: validators[1],
        amount: [
          {
            denom: `STAKE`,
            amount: `150`
          }
        ]
      }
    ],
    6: [
      {
        proposal_id: `6`,
        depositor: validators[0],
        amount: [
          {
            denom: `STAKE`,
            amount: `100`
          }
        ]
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
    // filter the txs for the ones for this account
    return state.txs.filter(tx => {
      let type = tx.tx.value.msg[0].type
      if (type === `cosmos-sdk/Send`) {
        return (
          tx.tx.value.msg[0].value.inputs.find(
            input => input.address === address
          ) ||
          tx.tx.value.msg[0].value.outputs.find(
            output => output.address === address
          )
        )
      }
      return false // only return bank transactions
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
      begin_redelegates = []
    }
  ) {
    let results = []
    let fromKey = state.keys.find(a => a.name === name)
    let fromAccount = state.accounts[fromKey.address]
    let delegator = state.stake[fromKey.address]
    if (!delegator) {
      state.stake[fromKey.address] = {
        delegations: [],
        unbonding_delegations: []
      }
      delegator = state.stake[fromKey.address]
    }
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

      let shares = parseInt(delegation.shares)
      delegation.shares = (shares + amount).toString()
      let candidate = state.candidates.find(
        c => c.operator_address === tx.validator_addr
      )
      // TODO: Update error msg
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

      updateValidatorShares(state, tx.validator_addr, amount)

      storeTx(`cosmos-sdk/MsgDelegate`, tx)
      results.push(txResult(0))
    }

    for (let tx of begin_unbondings) {
      incrementSequence(fromAccount)

      let amount = parseInt(tx.shares)

      // update stake
      let delegation = delegator.delegations.find(
        d => d.validator_addr === tx.validator_addr
      )
      if (!delegation) {
        results.push(txResult(2, `Nonexistent delegation`))
        return results
      }

      // update sender balance
      let coinBalance = fromAccount.coins.find(
        c => c.denom === state.stakingParameters.bond_denom
      )

      coinBalance.amount = String(parseInt(coinBalance.amount) + amount)

      let shares = parseInt(delegation.shares)
      delegation.shares = (+shares - amount).toString()

      updateValidatorShares(state, tx.validator_addr, amount)

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

    for (let tx of begin_redelegates) {
      incrementSequence(fromAccount)

      // check if source validator exist
      let srcValidator = state.candidates.find(
        c => c.operator_address === tx.validator_src_addr
      )

      if (!srcValidator) {
        results.push(txResult(3, `Nonexistent source validator`))
        return results
      }

      // check if dest validator exist
      let dstValidator = state.candidates.find(
        c => c.operator_address === tx.validator_dst_addr
      )

      if (!dstValidator) {
        results.push(txResult(3, `Nonexistent destination validator`))
        return results
      }

      // TODO: Update error msg
      if (dstValidator.revoked) {
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

      // check if delegation exists
      let srcDelegation = delegator.delegations.find(
        d => d.validator_addr === tx.validator_src_addr
      )
      if (!srcDelegation) {
        results.push(
          txResult(3, `Nonexistent delegation with source validator`)
        )
        return results
      }

      // check if there's an existing redelegation
      let redelegations = this.getRedelegations(tx.delegator_addr)
      let red = redelegations.find(
        red =>
          red.validator_src_addr === tx.validator_src_addr &&
          red.validator_dst_addr === tx.validator_dst_addr
      )

      if (red) {
        results.push(txResult(3, `conflicting redelegation`))
        return results
      }

      let height = getHeight()

      // check if amount of shares redelegated is valid
      if (Number(srcDelegation.shares) < tx.shares) {
        results.push(
          txResult(
            3,
            `cannot redelegate more shares than the current delegated shares amount`
          )
        )
        return results
      }
      // unbond shares from source validator
      srcDelegation.shares = String(Number(srcDelegation.shares) - tx.shares)
      srcDelegation.height = height

      // delegate to dst validator
      let dstDelegation = delegator.delegations.find(
        d => d.validator_addr === tx.validator_dst_addr
      )
      if (dstDelegation) {
        dstDelegation.shares = String(Number(dstDelegation.shares) + tx.shares)
      } else {
        delegator.delegations.push({
          delegator_addr: tx.delegator_addr,
          validator_addr: tx.validator_dst_addr,
          shares: tx.shares,
          height
        })
      }

      // add redelegation object
      let coins = {
        amount: tx.shares, // in mock mode we assume 1 share = 1 token
        denom: state.stakingParameters.bond_denom
      }
      let minTime = Date.now()
      red = {
        delegator_addr: tx.delegator_addr,
        validator_src_addr: tx.validator_src_addr,
        validator_dst_addr: tx.validator_dst_addr,
        shares_src: tx.shares,
        shares_dst: tx.shares,
        min_time: new Date(minTime + 10 * 60 * 1000).getTime(), // uses a 10 min unbonding period
        creation_height: height,
        initial_balance: coins,
        balance: coins
      }
      delegator.redelegations.push(red)

      // update validator shares
      updateValidatorShares(state, tx.validator_src_addr, -tx.shares)
      updateValidatorShares(state, tx.validator_dst_addr, tx.shares)

      storeTx(`cosmos-sdk/BeginRedelegate`, tx)
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
  getDelegations(delegatorAddress) {
    let delegator = state.stake[delegatorAddress] || {}
    return delegator.delegations || []
  },
  getUndelegations(delegatorAddress) {
    let delegator = state.stake[delegatorAddress] || {}
    return delegator.unbonding_delegations || []
  },
  getRedelegations(delegatorAddress) {
    let delegator = state.stake[delegatorAddress] || {}
    return delegator.redelegations || []
  },
  async getDelegatorTxs(addr, types = []) {
    // filter for transactions belonging to that delegator and are staking
    let delegatorTxs = state.txs.filter(tx => {
      let type = tx.tx.value.msg[0].type
      if (
        type === `cosmos-sdk/MsgDelegate` ||
        type === `cosmos-sdk/BeginRedelegate` ||
        type === `cosmos-sdk/BeginUnbonding`
      ) {
        return tx.tx.value.msg[0].value.delegator_addr === addr
      }
      return false
    })

    // map REST filters to tx types
    if (types.length === 0) types = [`bonding`, `unbonding`, `redelegate`]
    types = types.map(type => {
      if (type === `bonding`) return `cosmos-sdk/MsgDelegate`
      if (type === `unbonding`) return `cosmos-sdk/BeginUnbonding`
      if (type === `redelegate`) return `cosmos-sdk/BeginRedelegate`
    })

    return delegatorTxs.filter(
      tx => types.indexOf(tx.tx.value.msg[0].type) !== -1
    )
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
  async getStakingParameters() {
    return state.stakingParameters
  },
  async getProposals() {
    return state.proposals || []
  },
  async submitProposal({
    base_req,
    title,
    description,
    proposal_type,
    proposer,
    initial_deposit
  }) {
    let results = []
    // get new proposal id
    let proposal_id = `1`
    const proposalIds = Object.keys(state.proposals)
    if (state.proposals && proposalIds.length > 0) {
      proposal_id = String(
        parseInt(
          proposalIds.reduce((max_id, id) => (id > max_id ? id : max_id), `0`)
        ) + 1
      )
    }

    if (
      proposal_type !== `Text` &&
      proposal_type !== `ParameterChange` &&
      proposal_type !== `SoftwareUpgrade`
    ) {
      results.push(txResult(2, `${proposal_type} is not a valid proposal type`))
      return results
    }

    let tally_result = {
      yes: `0`,
      no: `0`,
      no_with_veto: `0`,
      abstain: `0`
    }
    let submit_time = Date.now()
    let deposit_end_time = moment(submit_time)
      .add(86400000, `ms`)
      .toDate()

    let proposal = {
      proposal_id,
      title,
      description,
      proposal_type,
      proposal_status: `DepositPeriod`,
      tally_result,
      submit_time,
      deposit_end_time,
      voting_start_time: undefined,
      voting_end_time: undefined,
      total_deposit: []
    }

    // we add the proposal to the state to make it available for the submitProposalDeposit function
    state.proposals[proposal.proposal_id] = proposal
    results = await this.submitProposalDeposit({
      base_req,
      proposal_id,
      depositor: proposer,
      amount: initial_deposit
    })
    // remove proposal from state if it fails
    if (results[0].check_tx.code !== 0) {
      delete state.proposals[proposal.proposal_id]
    }
    return results
  },
  async getProposal(proposalId) {
    return state.proposals[proposalId]
  },
  async getProposalTally(proposalId) {
    let proposal = await this.getProposal(proposalId)
    return proposal.tally_result
  },
  async getProposalDeposits(proposalId) {
    return state.deposits[proposalId] || []
  },
  async getProposalDeposit(proposalId, address) {
    return state.deposits[proposalId].find(
      deposit => deposit.depositor === address
    )
  },
  async submitProposalDeposit({
    proposal_id,
    base_req: { name, sequence },
    depositor,
    amount
  }) {
    let results = []
    let fromKey = state.keys.find(a => a.name === name)
    let fromAccount = state.accounts[fromKey.address]
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

    let proposal = await this.getProposal(proposal_id)
    if (!proposal) {
      results.push(txResult(3, `Nonexistent proposal`))
      return results
    } else if (
      proposal.proposal_status != `DepositPeriod` &&
      proposal.proposal_status != `VotingPeriod`
    ) {
      results.push(txResult(3, `Proposal #${proposal_id} already finished`))
      return results
    }

    let coin
    let submittedDeposit = {
      proposal_id,
      depositor,
      amount
    }

    // javascript's forEach doesn't support break, so using classic for loop...
    for (let i = 0; i < amount.length; i++) {
      coin = amount[i]
      let depositCoinAmt = parseInt(coin.amount)
      let coinBalance = fromAccount.coins.find(c => c.denom === coin.denom)

      if (depositCoinAmt < 0) {
        results.push(txResult(1, `Amount of ${coin.denom}s cannot be negative`))
        return results
      } else if (!coinBalance || coinBalance.amount < depositCoinAmt) {
        results.push(txResult(1, `Not enough ${coin.denom}s in your account`))
        return results
      }

      // update depositor's balance
      coinBalance.amount -= depositCoinAmt

      // ============= TOTAL PROPOSAL's DEPOSIT =============
      // Increment total deposit of the proposal
      let deposit = proposal.total_deposit.find(
        deposit => deposit.denom === coin.denom
      )
      if (!deposit) {
        // if there's no previous deposit in that denom we just append it to the total deposit
        proposal.total_deposit.push(coin)
      } else {
        // if there's an existing deposit with that denom we add the submited deposit amount to it
        let newAmt = String(parseInt(deposit.amount) + parseInt(coin.amount))
        deposit.amount = newAmt
      }

      // ============= USER'S DEPOSITS =============
      // check if there's an existing deposit by the depositor
      let prevDeposit =
        state.deposits[proposal_id] &&
        state.deposits[proposal_id].find(
          deposit => deposit.depositor === depositor
        )

      if (!prevDeposit) {
        // if no previous deposit by the depositor, we add it to the existing deposits
        if (!state.deposits[proposal_id]) state.deposits[proposal_id] = []
        state.deposits[proposal_id].push(submittedDeposit)
        break // break since no need to iterate over other coins
      } else {
        // ============= USER'S DEPOSITS WITH SAME COIN DENOM =============
        // if there's a prev deposit, add the new amount to the corresponding coin
        let prevDepCoin = prevDeposit.amount.find(prevDepCoin => {
          return prevDepCoin.denom === coin.denom
        })
        if (!prevDepCoin) {
          prevDeposit.amount.push(coin)
        } else {
          // there's a previous deposit from the depositor with the same coin
          let newAmt = parseInt(prevDepCoin.amount) + parseInt(coin.amount)
          prevDepCoin.amount = String(newAmt)
        }
      }
    }

    incrementSequence(fromAccount)

    // check if the propoposal is now active
    if (proposal.proposal_status === `DepositPeriod`) {
      // TODO: get min deposit denom from gov params instead of stake params
      let depositCoinAmt = proposal.total_deposit.find(coin => {
        return coin.denom === `STAKE`
      }).amount
      // TODO: get min deposit amount from gov params
      if (parseInt(depositCoinAmt) >= 10) {
        proposal.proposal_status = `VotingPeriod`
        // TODO: get voting time from gov params
        proposal.voting_start_time = Date.now()
        proposal.voting_end_time = moment(proposal.voting_start_time)
          .add(86400000, `ms`)
          .toDate()
      }
    }
    storeTx(`cosmos-sdk/MsgDeposit`, submittedDeposit)
    results.push(txResult(0))
    return results
  },
  async queryProposalVotes(proposalId) {
    return (
      state.votes[proposalId] ||
      Promise.reject({ message: `Invalid proposalId #${proposalId}` })
    )
  },
  async submitProposalVote({
    proposal_id,
    base_req: { name, sequence },
    option,
    voter
  }) {
    let results = []
    let fromKey = state.keys.find(a => a.name === name)
    let fromAccount = state.accounts[fromKey.address]

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

    let proposal = await this.getProposal(proposal_id)

    if (!proposal) {
      results.push(txResult(3, `Nonexistent proposal`))
      return results
    } else if (proposal.proposal_status != `VotingPeriod`) {
      results.push(txResult(3, `Proposal #${proposal_id} is inactive`))
      return results
    } else if (
      option !== `yes` &&
      option !== `no` &&
      option !== `no_with_veto` &&
      option !== `abstain`
    ) {
      results.push(txResult(3, `Invalid option '${option}'`))
      return results
    }

    let vote = {
      proposal_id,
      option,
      voter
    }

    state.votes[proposal_id].push(vote)
    let intTallyResult = parseInt(proposal.tally_result[option])
    proposal.tally_result[option] = String(intTallyResult + 1)

    storeTx(`cosmos-sdk/MsgVote`, vote)
    results.push(txResult(0))
    return results
  },
  async getProposalVote(proposal_id, address) {
    return state.votes[proposal_id].find(vote => vote.voter === address)
  },
  async queryProposals() {
    // TODO: return only value of the `value` property when https://github.com/cosmos/cosmos-sdk/issues/2507 is solved
    let proposals = state.proposals
    return Object.keys(proposals).map(key => {
      return {
        value: JSON.parse(JSON.stringify(proposals[key])),
        type: `gov/TextProposal`
      }
    })
  },
  async getGovernanceTxs(addr) {
    return (
      state.txs.filter(tx => {
        let type = tx.tx.value.msg[0].type

        if (type === `cosmos-sdk/MsgSubmitProposal`) {
          return tx.tx.value.msg[0].value.proposer === addr
        } else if (type === `cosmos-sdk/MsgDeposit`) {
          return tx.tx.value.msg[0].value.depositor === addr
        }

        return false
      }) || []
    )
  },
  async getGovDepositParameters() {
    return state.governanceParameters.deposit
  },
  async getGovTallyingParameters() {
    return state.governanceParameters.tallying
  },
  async getGovVotingParameters() {
    return state.governanceParameters.voting
  },
  // exports to be used in tests
  state,
  addresses,
  validators
}

function makeHash() {
  let text = ``
  const possible = `ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789`

  for (let i = 0; i < 40; i++) {
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

function updateValidatorShares(state, operator_address, amount) {
  let candidate = state.candidates.find(
    c => c.operator_address === operator_address
  )
  let shares = parseInt(candidate.tokens)
  candidate.tokens = (+shares - amount).toString()
  candidate.delegator_shares = (+shares - amount).toString()
}
