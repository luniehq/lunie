let express = require('express')
let proxy = require('express-http-proxy')
let randomBytes = require('crypto').pseudoRandomBytes

let randomPubkey = () => ({
  type: 'ed25519',
  data: randomBytes(32).toString('hex')
})

module.exports = function (port = 8999) {
  let app = express()

  // delegation mock API
  let candidates = new Array(205).fill(0).map(randomPubkey)
  app.get('/query/stake/candidate', (req, res) => {
    res.json({
      height: 10000,
      data: candidates
    })
  })
  app.get('/query/stake/candidate/:pubkey', (req, res) => {
    res.json({
      height: 10000,
      data: {
        pubkey: randomPubkey(),
        owner: {
          chain: 'gaia-1',
          app: 'sig',
          address: randomBytes(20).toString('hex')
        },
        shares: Math.floor(Math.random() * 1e7),
        voting_power: Math.floor(Math.random() * 1e5),
        description: 'This is a fake candidate description.'
      }
    })
  })

  // proxy everything else to light client
  app.use(proxy('http://localhost:8998'))

  app.listen(port)
}
