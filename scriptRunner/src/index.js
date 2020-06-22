var express = require('express')
var bodyParser = require('body-parser')
var timeout = require('connect-timeout');
var morgan = require('morgan')
var app = express()
require('dotenv').config()
const config = require('../config')

// Constants
const PORT = process.env.PORT || 9000;
const HOST = process.env.NODE_ENV = "docker" ? '0.0.0.0' : 'localhost';

const polkadotrewards = require("./polkadotrewards")

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


app.post('/polkadotrewards', polkadotrewards)

app.listen(PORT, HOST, () => console.log(`Script server running on http://localhost:${PORT}`))