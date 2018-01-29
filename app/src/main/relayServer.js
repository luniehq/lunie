let express = require('express')
let proxy = require('express-http-proxy')
let randomBytes = require('crypto').pseudoRandomBytes
let casual = require('casual')

let randomAddress = () => randomBytes(20).toString('hex')

let randomTime = () => Date.now() - casual.integer(0, 32e7)

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

module.exports = function ({relayServerPort, lcdPort, mock = false, onReconnectReq, onSuccesfulStart} = {}) {
  let app = express()

  // TODO this lets the server timeout until there is an external request
  // log all requests
  // app.use((req, res, next) => {
  //   console.log('REST request:', req.method, req.originalUrl, req.body)
  //   next()
  // })

  if (mock) {
    // delegation mock API
    app.post('/tx/stake/delegate/:pubkey/:amount', (req, res) => {
      res.json({
        'type': 'sigs/one',
        'data': {
          'tx': {
            'type': 'chain/tx',
            'data': {
              'chain_id': 'gaia-1',
              'expires_at': 0,
              'tx': {
                'type': 'nonce',
                'data': {
                  'sequence': 1,
                  'signers': [
                    {
                      'chain': '',
                      'app': 'sigs',
                      'addr': '84A057DCE7E1DB8EBE3903FC6B2D912E63EF9BEA'
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
                            'addr': '84A057DCE7E1DB8EBE3903FC6B2D912E63EF9BEA'
                          },
                          'coins': [
                            {
                              'denom': 'atom',
                              'amount': 1
                            }
                          ]
                        }
                      ],
                      'outputs': [
                        {
                          'address': {
                            'chain': '',
                            'app': 'sigs',
                            'addr': '84A057DCE7E1DB8EBE3903FC6B2D912E63EF9BEA'
                          },
                          'coins': [
                            {
                              'denom': 'atom',
                              'amount': 1
                            }
                          ]
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
      })
    })

    // tx history
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
  }

  app.get('/reconnect', async (req, res) => {
    console.log('requesting to reconnect')
    let nodeIP = await onReconnectReq()
    console.log('reconnected to', nodeIP)
    res.send(nodeIP)
  })

  app.get('/startsuccess', async (req, res) => {
    onSuccesfulStart()
    res.sendStatus(200)
  })

  // proxy everything else to light client
  app.use(proxy('http://localhost:' + lcdPort))

  app.listen(relayServerPort)
}
