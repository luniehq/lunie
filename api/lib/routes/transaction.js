var express = require('express')
var router = express.Router()
var { broadcast } = require('./../controller/transaction')

router.use(function timeLog(req, res, next) {
  req.txRequest = req.body && req.body.payload
  if (req.txRequest) {
    console.log(`Transaction ${Date.now()} ${req.txRequest.messageType}`)
  } else {
    res.json({ error: 'No Request Found' })
  }
  next()
})

router.use('/broadcast', async function (req, res) {
  const response = await broadcast(
    req.txRequest,
    req.headers.fingerprint || false,
    req.headers.development === 'true'
  )
  res.json(response)
})

module.exports = router
