var express = require('express')
var bodyParser = require('body-parser')
var timeout = require('connect-timeout');
var morgan = require('morgan')
var app = express()
require('dotenv').config()

const polkadotrewards = require("./polkadotrewards")

app.use(bodyParser.json())
app.use(timeout(120000))
app.use(morgan('combined'))
app.use(function (req, res, next) {
    const authenticationToken = req.header("Authorization")
    if (authenticationToken !== process.env.AUTHENTICATION_TOKEN) {
        res
            .status(403)
            .send()
        return
    }
    next()
})


app.post('/polkadotrewards', polkadotrewards)

app.listen(9000, () => console.log(`Script server running on http://localhost:9000`))