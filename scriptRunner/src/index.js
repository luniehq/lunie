var express = require('express')
var bodyParser = require('body-parser')
var timeout = require('connect-timeout');
var morgan = require('morgan')
var app = express()
require('dotenv').config()
const config = require('../config')

if (config.SENTRY_DSN) {
    const Sentry = require('@sentry/node')
    Sentry.init({
        dsn: config.SENTRY_DSN,
        release: require('../package.json').version
    })
}

// Constants
const PORT = process.env.PORT || 9000;
const HOST = process.env.NODE_ENV = "docker" ? '0.0.0.0' : 'localhost';

const { getKeybaseImages } = require("./keybase")
getKeybaseImages()
setInterval(getKeybaseImages, 1000 * 60 * 5) // check once every 5 minutes for new validators (throttled by 24 after an update)

const { getTwitterImages } = require("./twitterImages")
getTwitterImages()
setInterval(getTwitterImages, 1000 * 60 * 5) // check once every 5 minutes for new validators (throttled by 24 after an update)

const { cleanEvents } = require("./cleanEvents")
cleanEvents()
setInterval(cleanEvents, 1000 * 60 * 60 * 25) // check once every 24h to delete old events

app.use(bodyParser.json())
app.use(timeout(120000))
app.use(morgan('combined'))
app.use(function (req, res, next) {
  const authenticationToken = req.header("Authorization")
  if (authenticationToken !== config.authenticationToken) {
    res
    .status(403)
    .send()
    return
  }
  next()
})


const polkadotrewards = require("./polkadotrewards")
app.post('/polkadotrewards', polkadotrewards)

app.listen(PORT, HOST, () => console.log(`Script server running on http://localhost:${PORT}`))