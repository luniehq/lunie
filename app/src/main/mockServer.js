let express = require('express')
let proxy = require('express-http-proxy')
let randomBytes = require('crypto').pseudoRandomBytes
let casual = require('casual')

let randomPubkey = () => ({
  type: 'ed25519',
  data: randomBytes(32).toString('hex')
})

let randomAddress = () => randomBytes(20).toString('hex')

let randomTime = () => Date.now() - casual.integer(0, 32e7)

let randomTx = ({ from, to }) => {
  let amountOne = casual.double(1, 1e6)
  let amountTwo = casual.double(1, 1e4)
  let amountThree = casual.double(1, 1e2)
  let threeCoins = [
    { amount: amountOne, denom: 'fermion' },
    { amount: amountThree, denom: 'lepton' },
    { amount: amountTwo, denom: 'quark' }
  ]
  let twoCoins = [
    { amount: amountThree, denom: 'lepton' },
    { amount: amountTwo, denom: 'quark' }
  ]
  let oneCoin = [
    { amount: amountOne, denom: 'fermion' }
  ]
  let coins = [oneCoin, twoCoins, threeCoins]
  let randomCoins = coins[Math.floor(Math.random() * coins.length)]
  return {
    tx: {
      inputs: [{
        sender: from || randomAddress(),
        coins: randomCoins
      }],
      outputs: [{
        receiver: to || randomAddress(),
        coins: randomCoins
      }]
    },
    time: randomTime(),
    height: 1000
  }
}

let randomBondTx = (address, delegator) => ({
  tx: {
    type: Math.random() > 0.5 ? 'bond' : 'unbond',
    validator: delegator ? randomAddress() : address,
    address: delegator ? address : randomAddress(),
    shares: casual.integer(1, 1e6)
  },
  time: randomTime(),
  height: 1000
})

let randomCandidate = () => ({
  address: randomAddress(),
  owner: randomAddress(), // address
  shares: casual.integer(1000, 1e7),
  votingPower: casual.integer(10, 1e5),
  since: casual.date('YYYY-MM-DD'),
  description: {
    name: casual.username,
    website: casual.url,
    details: casual.sentences(3)
  },
  commissionRate: casual.double(0.005, 0.05),
  commissionMax: casual.double(0.05, 0.25),
  status: [ 'active', 'bonding', 'unbonding' ][Math.floor(Math.random() * 3)],
  slashRatio: Math.random() < 0.9 ? casual.double(0.01, 0.5) : 0,
  reDelegatingShares: casual.integer(1000, 1e7)
})

module.exports = function (port = 8999) {
  let app = express()

  // TODO this lets the server timeout until there is an external request
  // log all requests
  // app.use((req, res, next) => {
  //   console.log('REST request:', req.method, req.originalUrl, req.body)
  //   next()
  // })

  // delegation mock API
  let candidates = new Array(50).fill(0).map(randomPubkey)
  // app.get('/query/stake/candidates', (req, res) => {
  //   res.json({
  //     height: 10000,
  //     data: candidates
  //   })
  // })
  // app.get('/query/stake/candidates/:pubkey', (req, res) => {
  //   res.json({
  //     height: 10000,
  //     data: {
  //       pubkey: randomPubkey(),
  //       owner: {
  //         chain: 'gaia-1',
  //         app: 'sig',
  //         address: randomBytes(20).toString('hex')
  //       },
  //       shares: Math.floor(Math.random() * 1e7),
  //       voting_power: Math.floor(Math.random() * 1e5),
  //       description: JSON.stringify({
  //         description: casual.sentences(3),
  //         commission: casual.double(0.005, 0.05),
  //         commissionMax: casual.double(0.05, 0.25),
  //         commissionMaxRate: casual.double(0.005, 0.05),
  //         url: casual.url,
  //         keybaseID: casual.username,
  //         country: casual.country,
  //         startDate: casual.date('YYYY-MM-DD')
  //       })
  //     }
  //   })
  // })
  // app.post('/tx/stake/delegate/:pubkey/:amount', (req, res) => {
  //   res.json({
  //     'type': 'sigs/one',
  //     'data': {
  //       'tx': {
  //         'type': 'chain/tx',
  //         'data': {
  //           'chain_id': 'gaia-1',
  //           'expires_at': 0,
  //           'tx': {
  //             'type': 'nonce',
  //             'data': {
  //               'sequence': 1,
  //               'signers': [
  //                 {
  //                   'chain': '',
  //                   'app': 'sigs',
  //                   'addr': '84A057DCE7E1DB8EBE3903FC6B2D912E63EF9BEA'
  //                 }
  //               ],
  //               'tx': {
  //                 'type': 'coin/send',
  //                 'data': {
  //                   'inputs': [
  //                     {
  //                       'address': {
  //                         'chain': '',
  //                         'app': 'sigs',
  //                         'addr': '84A057DCE7E1DB8EBE3903FC6B2D912E63EF9BEA'
  //                       },
  //                       'coins': [
  //                         {
  //                           'denom': 'atom',
  //                           'amount': 1
  //                         }
  //                       ]
  //                     }
  //                   ],
  //                   'outputs': [
  //                     {
  //                       'address': {
  //                         'chain': '',
  //                         'app': 'sigs',
  //                         'addr': '84A057DCE7E1DB8EBE3903FC6B2D912E63EF9BEA'
  //                       },
  //                       'coins': [
  //                         {
  //                           'denom': 'atom',
  //                           'amount': 1
  //                         }
  //                       ]
  //                     }
  //                   ]
  //                 }
  //               }
  //             }
  //           }
  //         }
  //       },
  //       'signature': {
  //         'Sig': null,
  //         'Pubkey': null
  //       }
  //     }
  //   })
  // })
  // app.get('/candidates', (req, res) => {
  //   res.json(new Array(200).fill(0).map(randomCandidate))
  // })

  // tx history
  app.get('/tx/coins/:address', (req, res) => {
    let { address } = req.params
    let txs = []
    for (let i = 0; i < 100; i++) {
      let toMe = Math.random() > 0.5
      txs.push(randomTx(toMe ? { to: address } : { from: address }))
    }
    txs.sort((a, b) => b.time - a.time)
    res.json(txs)
  })
  app.get('/tx/bondings/delegator/:address', (req, res) => {
    let { address } = req.params
    let txs = new Array(100).fill(0)
      .map(() => randomBondTx(address, true))
    txs.sort((a, b) => b.time - a.time)
    res.json(txs)
  })
  app.get('/tx/bondings/validator/:address', (req, res) => {
    let { address } = req.params
    let txs = new Array(100).fill(0)
      .map(() => randomBondTx(address, false))
    txs.sort((a, b) => b.time - a.time)
    res.json(txs)
  })

  // proxy everything else to light client
  app.use(proxy('http://localhost:8998'))

  app.listen(port)
}
