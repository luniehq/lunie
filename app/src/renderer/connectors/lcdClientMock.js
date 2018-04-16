"use strict"

let state = {
  keys: [
    {
      name: "MOCK_ACCOUNT",
      password: "1234567890",
      address: "DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B"
    }
  ],
  accounts: {
    DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B: {
      coins: [{
        denom: 'mycoin',
        amount: 1000
      }, {
        denom: 'fermion',
        amount: 2300
      }],
      sequence: 1
    }
  },
  txs: [{
    tx: {
      hash: 'x',
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
  }],
  nonces: { 'DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B': 0 },
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
      "7A9D783CE542B23FA23DC7F101460879861205772606B4C3FAEAFBEDFB00E7BD": {
        PubKey: {
          data:
            "7A9D783CE542B23FA23DC7F101460879861205772606B4C3FAEAFBEDFB00E7BD"
        },
        Shares: 5
      }
    }
  },
  delegates: [
    {
      address: "70705055A9FA5901735D0C3F0954501DDE667327",
      pub_key: {
        type: "ed25519",
        data: "88564A32500A120AA72CEFBCF5462E078E5DDB70B6431F59F778A8DC4DA719A4"
      },
      voting_power: 14,
      accum: 585,
      description: {
        description: "Mr Mounty",
        moniker: "mr_mounty",
        country: "Canada"
      }
    },
    {
      address: "760ACDE75EFC3DD0E4B2A6A3B96D91C05349EA31",
      pub_key: {
        type: "ed25519",
        data: "7A9D783CE542B23FA23DC7F101460879861205772606B4C3FAEAFBEDFB00E7BD"
      },
      voting_power: 32,
      accum: -1107,
      description: {
        description: "Good Guy Greg",
        moniker: "good_greg",
        country: "USA"
      }
    },
    {
      address: "77C26DF82654C5A5DDE5C6B7B27F3F06E9C223C0",
      pub_key: {
        type: "ed25519",
        data: "651E7B12B3C7234FB82B4417C59DCE30E4EA28F06AD0ACAEDFF05F013E463F10"
      },
      voting_power: 19,
      accum: 539,
      description: {
        description: "Herr Schmidt",
        moniker: "herr_schmidt",
        country: "DE"
      }
    }
  ]
}

module.exports = {
  async lcdConnected () { return true },

  // keys
  async generateSeed () {
    return 'grace admit inherit female grant pledge shine inquiry pencil acid capable damage elegant voice aunt abandon'
  },
  async storeKey ({ name, password, seed }) {
    let key = {
      name,
      password,
      address: makeAddress()
    }
    state.keys.push(key)
    return key
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
  async updateKey (account, { name, old_password, new_password }) { // eslint-disable-line camelcase
    let key = state.keys.find(k => k.name === name)
    if (key.password !== old_password) { // eslint-disable-line camelcase
      throw new Error('Passwords do not match')
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
  async queryAccount (address) {
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
  async send (to, req) {
    let fromKey = state.keys.find(a => a.name === req.name)
    let fromAccount = state.accounts[fromKey.address]

    for (let { denom, amount } of req.amount) {
      if (fromAccount.coins.find(c => c.denom === denom).amount < amount) {
        return txResult(1, 'Not enough coins in your account')
      }
    }

    // check/update nonce
    if (fromAccount.sequence !== req.sequence) {
      return txResult(2, `Expected sequence "${fromAccount.sequence}", got "${req.sequence}"`)
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

  // staking
  async candidate(pubkey) {
    return {
      data: state.delegates.find(delegate => delegate.pub_key.data === pubkey)
    }
  },
  async candidates() {
    return { data: state.delegates.map(({ pub_key }) => pub_key) } // eslint-disable-line camelcase
  },
  async bondingsByDelegator ([address, delegatePubkey]) {
    let stake = state.stake[address]
    if (stake && stake[delegatePubkey]) {
      return { data: stake[delegatePubkey] }
    }
    return {
      data: {
        PubKey: { data: delegatePubkey },
        Shares: 0
      }
    }
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

function txResult (code = 0, message = '') {
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
