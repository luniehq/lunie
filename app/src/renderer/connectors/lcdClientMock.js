"use strict"

let state = {
  keys: [
    {
      name: "default",
      password: "1234567890",
      address: "DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B"
    }
  ],
  accounts: {
    DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B: {
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
  nonces: { DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B: 0 },
  txs: [
    {
      tx: {
        hash: "x",
        inputs: [
          {
            coins: [
              {
                denom: "jbcoins",
                amount: 1234
              }
            ],
            sender: makeAddress()
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
            receiver: "DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B"
          }
        ]
      },
      height: 1
    },
    {
      tx: {
        hash: "y",
        inputs: [
          {
            coins: [
              {
                denom: "fabocoins",
                amount: 1234
              }
            ],
            sender: "DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B"
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
            receiver: makeAddress()
          }
        ]
      },
      height: 150
    }
  ],
  stake: {
    DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B: {
      "70705055A9FA5901735D0C3F0954501DDE667327": {
        delegator_addr: "DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B",
        validator_addr: "70705055A9FA5901735D0C3F0954501DDE667327",
        shares: "5/1",
        height: 123
      }
    }
  },
  candidates: [
    {
      owner: "70705055A9FA5901735D0C3F0954501DDE667327",
      pub_key: {
        type: "AC26791624DE60",
        data: "t3zVnKU42WNH+NtYFcstZRLFVULWV8VagoP0HwW43Pk="
      },
      revoked: false,
      pool_shares: { amount: "14/1" },
      description: {
        description: "Mr Mounty",
        moniker: "mr_mounty",
        country: "Canada"
      }
    },
    {
      owner: "760ACDE75EFC3DD0E4B2A6A3B96D91C05349EA31",
      pub_key: {
        type: "AC26791624DE60",
        data: "9M4oaDArXKVU5ffqjq2TkynTCMJlyLzpzZLNjHtqM+w="
      },
      pool_shares: { amount: "32/1" },
      description: {
        description: "Good Guy Greg",
        moniker: "good_greg",
        country: "USA"
      }
    },
    {
      owner: "77C26DF82654C5A5DDE5C6B7B27F3F06E9C223C0",
      pub_key: {
        type: "AC26791624DE60",
        data: "dlN5SLqeT3LT9WsUK5iuVq1eLQV2Q1JQAuyN0VwSWK0="
      },
      pool_shares: { amount: "19/1" },
      description: {
        description: "Herr Schmidt",
        moniker: "herr_schmidt",
        country: "DE"
      }
    }
  ]
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
  async coinTxs(address) {
    return state.txs.filter(tx => {
      return (
        tx.tx.inputs.find(input => input.sender === address) ||
        tx.tx.outputs.find(output => output.receiver === address)
      )
    })
  },
  async send(to, req) {
    let fromKey = state.keys.find(a => a.name === req.name)
    let fromAccount = state.accounts[fromKey.address]
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

    return txResult(0)
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
  }
}

function makeAddress() {
  var text = ""
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

  for (var i = 0; i < 40; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }

  return text
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
