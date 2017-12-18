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

module.exports = function (port = 8999) {
  let app = express()

  // TODO this lets the server timeout until there is an external request
  // log all requests
  // app.use((req, res, next) => {
  //   console.log('REST request:', req.method, req.originalUrl, req.body)
  //   next()
  // })

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

  // proxy everything else to light client
  app.use(proxy('http://localhost:8998'))

  app.listen(port)
}
