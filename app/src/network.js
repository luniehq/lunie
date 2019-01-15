"use strict"

const { join } = require(`path`)
const { readFileSync } = require(`fs-extra`)
const config = require(`./config.js`)

// this network gets used if none is specified via the
// COSMOS_NETWORK env var
const DEFAULT_NETWORK = join(__dirname, `../networks/` + config.default_network)
const networkPath = process.env.COSMOS_NETWORK || DEFAULT_NETWORK

const genesisText = readFileSync(join(networkPath, `genesis.json`), `utf8`)
const genesis = JSON.parse(genesisText)
const networkName = genesis.chain_id

module.exports = {
  path: networkPath,
  name: networkName
}
