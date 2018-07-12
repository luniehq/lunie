"use strict"
const b32 = require("../scripts/b32.js")
const { getHeight } = require("./rpcWrapperMock.js")

const botAddress = "cosmosaccaddr1p6zajjw6xged056andyhn62lm7axwzyspkzjq0"
const addresses = [
  "cosmosaccaddr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9",
  "cosmosaccaddr1pxdf0lvq5jvl9uxznklgc5gxuwzpdy5ynem546",
  botAddress
]
const validators = [
  "cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw",
  "cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au",
  "cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctgurrg7n"
]
let state = {
  keys: [
    {
      name: "default",
      password: "1234567890",
      address: addresses[0]
    },
    {
      name: "nonexistent_account",
      password: "1234567890",
      address: addresses[1]
    }
  ],
  accounts: {
    [addresses[0]]: {
      coins: [
        {
          denom: "mycoin",
          amount: 1000
        },
        {
          denom: "fermion",
          amount: 2300
        },
        {
          denom: "steak",
          amount: 1000
        }
      ],
      sequence: 1
    }
  },
  txs: [
    {
      tx: {
        hash: "x",
        inputs: [
          {
            denom: "mycoin",
            amount: 1000
          },
          {
            denom: "fermion",
            amount: 2300
          }
        ]
      }
    }
  ],
  nonces: { [addresses[0]]: 0 },
  txs: [
    {
      tx: {
        value: {
          msg: {
            value: {
              inputs: [
                {
                  coins: [
                    {
                      denom: "jbcoins",
                      amount: 1234
                    }
                  ],
                  address: makeAddress()
                }
              ],
              outputs: [
                {
                  coins: [
                    {
                      denom: "jbcoins",
                      amount: 1234
                    }
                  ],
                  address: addresses[0]
                }
              ]
            }
          }
        }
      },
      height: 1
    },
    {
      tx: {
        value: {
          msg: {
            value: {
              inputs: [
                {
                  coins: [
                    {
                      denom: "fabocoins",
                      amount: 1234
                    }
                  ],
                  address: addresses[0]
                }
              ],
              outputs: [
                {
                  coins: [
                    {
                      denom: "fabocoins",
                      amount: 1234
                    }
                  ],
                  address: makeAddress()
                }
              ]
            }
          }
        }
      },
      height: 150
    }
  ],
  stake: {
    [addresses[0]]: {
      [validators[0]]: {
        delegator_addr: addresses[0],
        validator_addr: validators[0],
        shares: "130/1",
        height: 123
      }
    }
  },
  candidates: [
    {
      owner: validators[0],
      pub_key: {
        type: "AC26791624DE60",
        data: "t3zVnKU42WNH+NtYFcstZRLFVULWV8VagoP0HwW43Pk="
      },
      revoked: false,
      pool_shares: { amount: "14" },
      delegator_shares: "14",
      description: {
        description: "Mr Mounty",
        moniker: "mr_mounty",
        country: "Canada"
      }
    },
    {
      owner: validators[1],
      pub_key: {
        type: "AC26791624DE60",
        data: "9M4oaDArXKVU5ffqjq2TkynTCMJlyLzpzZLNjHtqM+w="
      },
      pool_shares: { amount: "0" },
      delegator_shares: "0",
      description: {
        description: "Good Guy Greg",
        moniker: "good_greg",
        country: "USA"
      }
    },
    {
      owner: validators[2],
      pub_key: {
        type: "AC26791624DE60",
        data: "dlN5SLqeT3LT9WsUK5iuVq1eLQV2Q1JQAuyN0VwSWK0="
      },
      pool_shares: { amount: "19" },
      delegator_shares: "19",
      description: {
        description: "Herr Schmidt",
        moniker: "herr_schmidt_revoked",
        country: "DE"
      },
      revoked: true
    }
  ],
  sendHeight: 2
}

module.exports = {
  async lcdConnected() {
    return true
  },

  // keys
  async generateSeed() {
    return "grace admit inherit female grant pledge shine inquiry pencil acid capable damage elegant voice aunt abandon"
  },
  async storeKey({ name, password, seed }) {
    let key = {
      name,
      password,
      address: makeAddress()
    }
    state.keys.push(key)
    return key.address
  },
  async listKeys() {
    return state.keys.map(k => ({
      name: k.name,
      address: k.address
    }))
  },
  async getKey(name) {
    return state.keys.find(k => k.name === name)
  },
  async updateKey(account, { name, old_password, new_password }) {
    // eslint-disable-line camelcase
    let key = state.keys.find(k => k.name === name)
    if (key.password !== old_password) {
      // eslint-disable-line camelcase
      throw new Error("Passwords do not match")
    }
    key.password = new_password // eslint-disable-line camelcase
  },
  // axios handles DELETE requests different then other requests, we have to but the body in a config object with the prop data
  async deleteKey(account, { name, password }) {
    let key = state.keys.find(k => k.name === name)
    if (key.password !== password) {
      throw new Error("Passwords do not match")
    }
    state.keys = state.keys.filter(k => k.name !== name)
  },

  // coins
  async queryAccount(address) {
    return state.accounts[address]
  },
  async txs(address) {
    return state.txs.filter(tx => {
      return (
        tx.tx.value.msg.value.inputs.find(input => input.address === address) ||
        tx.tx.value.msg.value.outputs.find(output => output.address === address)
      )
    })
  },
  async tx(hash) {
    return {}
  },
  async send(to, req) {
    let fromKey = state.keys.find(a => a.name === req.name)
    if (!fromKey)
      throw Error(
        "Key you want to send from does not exist in the lcd connection mock"
      )
    return send(to, fromKey.address, req)
  },
  ibcSend(to, req) {
    // XXX ignores chainId, treated as normal send
    to = to.split("/")[1]
    return module.exports.send(to, req)
  },

  // staking
  async updateDelegations({ name, sequence, delegate, unbond }) {
    let results = []

    let fromKey = state.keys.find(a => a.name === name)
    let fromAccount = state.accounts[fromKey.address]
    if (fromAccount == null) {
      results.push(txResult(1, "Nonexistent account"))
      return results
    }

    // check nonce
    if (fromAccount.sequence !== sequence) {
      results.push(
        txResult(
          2,
          `Expected sequence "${fromAccount.sequence}", got "${sequence}"`
        )
      )
      return results
    }

    for (let tx of delegate) {
      let { denom, amount } = tx.bond
      if (amount < 0) {
        results.push(txResult(1, "Amount cannot be negative"))
        return results
      }
      if (fromAccount.coins.find(c => c.denom === denom).amount < amount) {
        results.push(txResult(1, "Not enough coins in your account"))
        return results
      }

      // update sender account
      fromAccount.sequence += 1
      fromAccount.coins.find(c => c.denom === denom).amount -= amount

      // update stake
      let delegator = state.stake[fromKey.address]
      if (!delegator) {
        state.stake[fromKey.address] = {}
        delegator = state.stake[fromKey.address]
      }
      let delegation = delegator[tx.validator_addr]
      if (!delegation) {
        delegation = {
          delegator_addr: fromKey.address,
          validator_addr: tx.validator_addr,
          shares: "0/1",
          height: 0
        }
        delegator[tx.validator_addr] = delegation
      }
      let shares = +delegation.shares.split("/")[0]
      delegation.shares = shares + +tx.bond.amount + "/1"

      let candidate = state.candidates.find(c => c.owner === tx.validator_addr)
      shares = +candidate.pool_shares.amount.split("/")[0]
      candidate.pool_shares.amount = shares + +tx.bond.amount + "/1"

      results.push(txResult(0))
    }

    for (let tx of unbond) {
      fromAccount.sequence += 1

      let amount = +tx.shares.split("/")[0]

      // update sender balance
      fromAccount.coins.find(c => c.denom === "steak").amount += amount

      // update stake
      let delegator = state.stake[fromKey.address]
      if (!delegator) {
        results.push(txResult(2, "Nonexistent delegator"))
        return results
      }
      let delegation = delegator[tx.validator_addr]
      if (!delegation) {
        results.push(txResult(2, "Nonexistent delegation"))
        return results
      }
      let shares = delegation.shares.split("/")[0]
      delegation.shares = +shares - amount + "/1"

      let candidate = state.candidates.find(c => c.owner === tx.validator_addr)
      shares = candidate.pool_shares.amount.split("/")[0]
      candidate.pool_shares.amount = +shares - amount + "/1"

      results.push(txResult(0))
    }

    return results
  },
  async queryDelegation(delegatorAddress, validatorAddress) {
    let delegator = state.stake[delegatorAddress]
    if (!delegator) return
    return delegator[validatorAddress]
  },
  async candidates() {
    return state.candidates
  },
  async getValidators() {
    return {
      block_height: 1,
      validators: state.candidates
    }
  },
  // exports to be used in tests
  state,
  addresses,
  validators
}

function makeAddress() {
  var text = ""
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

  for (var i = 0; i < 40; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return b32.encode(text)
}

function send(to, from, req) {
  let fromAccount = state.accounts[from]
  if (fromAccount == null) {
    return txResult(1, "Nonexistent account")
  }

  for (let { denom, amount } of req.amount) {
    if (amount < 0) {
      return txResult(1, "Amount cannot be negative")
    }
    if (fromAccount.coins.find(c => c.denom === denom).amount < amount) {
      return txResult(1, "Not enough coins in your account")
    }
  }

  // check/update nonce
  if (fromAccount.sequence !== req.sequence) {
    return txResult(
      2,
      `Expected sequence "${fromAccount.sequence}", got "${req.sequence}"`
    )
  }
  fromAccount.sequence += 1

  // update sender balances
  for (let { denom, amount } of req.amount) {
    fromAccount.coins.find(c => c.denom === denom).amount -= amount
  }

  // update receiver balances
  let receiverAccount = state.accounts[to]
  if (!receiverAccount) {
    receiverAccount = state.accounts[to] = {
      coins: [],
      sequence: 0
    }
  }
  for (let { denom, amount } of req.amount) {
    let receiverCoin = receiverAccount.coins.find(c => c.denom === denom)
    if (!receiverCoin) {
      receiverCoin = { amount: 0, denom }
      receiverAccount.coins.push(receiverCoin)
    }
    receiverCoin.amount += amount
  }

  // log tx
  state.txs.push({
    tx: {
      value: {
        msg: {
          value: {
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
          }
        }
      }
    },
    height: getHeight() + (from === botAddress ? 1 : 0),
    time: Date.now()
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

function txResult(code = 0, message = "") {
  return {
    check_tx: {
      code: code,
      data: "",
      log: message,
      gas: "0",
      fee: "0"
    },
    deliver_tx: {
      code: 0,
      data: "",
      log: "",
      tags: []
    },
    hash: "999ADECC2DE8C3AC2FD4F45E5E1081747BBE504A",
    height: 0
  }
}
