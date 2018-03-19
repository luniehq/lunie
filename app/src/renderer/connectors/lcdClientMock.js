'use strict'

let state = {
  keys: [{
    name: 'MOCK_ACCOUNT',
    password: '1234567890',
    address: 'DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B'
  }],
  accounts: {
    DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B: {
      coins: [{
        denom: 'mycoin',
        amount: 1000
      }]
    }
  },
  nonces: { DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B: 0 },
  txs: [{
    tx: {
      hash: 'x',
      inputs: [
        {
          coins: [{
            denom: 'jbcoins',
            amount: 1234
          }],
          sender: makeAddress()
        }
      ],
      outputs: [
        {
          coins: [{
            denom: 'jbcoins',
            amount: 1234
          }],
          receiver: 'DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B'
        }
      ]
    },
    height: 1
  }, {
    tx: {
      hash: 'y',
      inputs: [
        {
          coins: [{
            denom: 'fabocoins',
            amount: 1234
          }],
          sender: 'DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B'
        }
      ],
      outputs: [
        {
          coins: [{
            denom: 'fabocoins',
            amount: 1234
          }],
          receiver: makeAddress()
        }
      ]
    },
    height: 150
  }],
  stake: {
    DF096FDE8D380FA5B2AD20DB2962C82DDEA1ED9B: {
      '7A9D783CE542B23FA23DC7F101460879861205772606B4C3FAEAFBEDFB00E7BD': {
        PubKey: { data: '7A9D783CE542B23FA23DC7F101460879861205772606B4C3FAEAFBEDFB00E7BD' },
        Shares: 5
      }
    }
  },
  delegates: [
    {
      'address': '70705055A9FA5901735D0C3F0954501DDE667327',
      'pub_key': {
        'type': 'ed25519',
        'data': '88564A32500A120AA72CEFBCF5462E078E5DDB70B6431F59F778A8DC4DA719A4'
      },
      'voting_power': 14,
      'accum': 585,
      description: {
        description: 'Mr Mounty',
        moniker: 'mr_mounty',
        country: 'Canada'
      }
    },
    {
      'address': '760ACDE75EFC3DD0E4B2A6A3B96D91C05349EA31',
      'pub_key': {
        'type': 'ed25519',
        'data': '7A9D783CE542B23FA23DC7F101460879861205772606B4C3FAEAFBEDFB00E7BD'
      },
      'voting_power': 32,
      'accum': -1107,
      description: {
        description: 'Good Guy Greg',
        moniker: 'good_greg',
        country: 'USA'
      }
    },
    {
      'address': '77C26DF82654C5A5DDE5C6B7B27F3F06E9C223C0',
      'pub_key': {
        'type': 'ed25519',
        'data': '651E7B12B3C7234FB82B4417C59DCE30E4EA28F06AD0ACAEDFF05F013E463F10'
      },
      'voting_power': 19,
      'accum': 539,
      description: {
        description: 'Herr Schmidt',
        moniker: 'herr_schmidt',
        country: 'DE'
      }
    }
  ]
}

module.exports = {
  async lcdConnected () { return true },
  async sign ({ name, password, tx }) {
    return {
      'type': 'sigs/one',
      'data': {
        'tx': tx,
        'signature': {
          'Sig': {
            'type': 'ed25519',
            'data': '4631B03666EDF3D95E67A0700AD93741728E9466E51A8684F8637B935BB9A296ACE66256F2EDEC4F469FB9A940A4C1D30BB9170B5CA5292A6570A9F836DB7609'
          },
          'Pubkey': {
            'type': 'ed25519',
            'data': '81B11E717789600CC192B26F452A983DF13B985EE75ABD9DD9E68D7BA007A958'
          }
        }
      }
    }
  },
  async postTx (signedTx) {
    let outerTx = signedTx.data.tx.data.tx.data.tx
    let address = outerTx.data.signers[0].addr
    state.txs.push(outerTx.data.tx)
    state.nonces[address]++

    return {
      'check_tx': {
        'code': 0,
        'data': '',
        'log': '',
        'gas': '0',
        'fee': '0'
      },
      'deliver_tx': {
        'code': 0,
        'data': '',
        'log': '',
        'tags': []
      },
      'hash': '999ADECC2DE8C3AC2FD4F45E5E1081747BBE504A',
      'height': 0
    }
  },

  // keys
  async generateKey ({ name, password }) {
    let key = {
      name, password, address: makeAddress()
    }
    state.keys.push(key)
    return key
  },
  async listKeys () {
    return state.keys.map(k => ({
      name: k.name,
      address: k.address
    }))
  },
  async getKey (name) {
    return state.keys.find(k => k.name === name)
  },
  async updateKey (account, { name, password, new_passphrase }) { // eslint-disable-line camelcase
    let key = state.keys.find(k => k.name === name)
    if (key.password !== password) {
      throw new Error('Passwords do not match')
    }
    key.password = new_passphrase // eslint-disable-line camelcase
  },
  // axios handles DELETE requests different then other requests, we have to but the body in a config object with the prop data
  async deleteKey (account, { name, password }) {
    let key = state.keys.find(k => k.name === name)
    key
    if (key.password !== password) {
      throw new Error('Passwords do not match')
    }
    state.keys = state.keys.filter(k => k.name === name)
  },
  async recoverKey ({ name, password, seed_phrase }) { // eslint-disable-line camelcase
    let key = {
      name, password, address: makeAddress()
    }
    state.keys.push(key)
    return key
  },

  // coins
  async buildSend ({ sequence, from: { addr: fromAddr }, to: { addr: toAddr }, fees, amount }) {
    return {
      'type': 'sigs/one',
      'data': {
        'tx': {
          'type': 'chain/tx',
          'data': {
            'chain_id': 'mock-chain',
            'expires_at': 0,
            'tx': {
              'type': 'nonce',
              'data': {
                'sequence': sequence,
                'signers': [
                  {
                    'chain': '',
                    'app': 'sigs',
                    'addr': fromAddr
                  }
                ],
                'tx': {
                  'type': 'coin/send',
                  'data': {
                    'inputs': [
                      {
                        'address': {
                          'chain': '',
                          'app': 'sigs',
                          'addr': fromAddr
                        },
                        'coins': amount
                      }
                    ],
                    'outputs': [
                      {
                        'address': {
                          'chain': '',
                          'app': 'sigs',
                          'addr': toAddr
                        },
                        'coins': amount
                      }
                    ]
                  }
                }
              }
            }
          }
        },
        'signature': {
          'Sig': null,
          'Pubkey': null
        }
      }
    }
  },
  async queryAccount (address) {
    let account = state.accounts[address]
    if (account) {
      return { data: state.accounts[address] }
    }
    return { data: { coins: [] } }
  },
  async coinTxs (address) {
    return state.txs.filter(tx => {
      return tx.tx.inputs.find(input => input.sender === address) || tx.tx.outputs.find(output => output.receiver === address)
    })
  },

  // nonce
  async queryNonce (address) {
    return state.nonces[address]
  },

  // staking
  async candidate (pubkey) {
    return { data: state.delegates.find(delegate => delegate.pub_key.data === pubkey) }
  },
  async candidates () {
    return { data: state.delegates.map(({ pub_key }) => pub_key) } // eslint-disable-line camelcase
  },
  async buildDelegate ({ sequence, from, amount, pubkey }) {
    return {
      'type': 'sigs/one',
      'data': {
        'tx': {
          'type': 'chain/tx',
          'data': {
            'chain_id': 'mock-chain',
            'expires_at': 0,
            'tx': {
              'type': 'nonce',
              'data': {
                'sequence': sequence,
                'signers': [
                  {
                    'chain': '',
                    'app': 'sigs',
                    'addr': from.addr
                  }
                ],
                'tx': {
                  'type': 'stake/delegate',
                  'data': {
                    'pub_key': pubkey,
                    'amount': amount
                  }
                }
              }
            }
          }
        },
        'signature': {
          'Sig': null,
          'Pubkey': null
        }
      }
    }
  },
  async buildUnbond () {
    throw Error('Not implemented')
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

function makeAddress () {
  var text = ''
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

  for (var i = 0; i < 40; i++) { text += possible.charAt(Math.floor(Math.random() * possible.length)) }

  return text
}
