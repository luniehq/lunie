let express = require('express')
let proxy = require('express-http-proxy')

module.exports = function ({ relayServerPort, lcdPort, onReconnectReq, onSuccesfulStart } = {}) {
  let app = express()

  // TODO this lets the server timeout until there is an external request
  // log all requests
  // app.use((req, res, next) => {
  //   console.log('REST request:', req.method, req.originalUrl, req.body)
  //   next()
  // })

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
