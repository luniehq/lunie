var express = require('express')
var router = express.Router()

router.use(function timeLog(req, res, next) {
  console.log('Transaction Received', Date.now())
  next()
})

router.use('/', function(req, res) {
  res.send('Transaction API Request received')
})

module.exports = router
