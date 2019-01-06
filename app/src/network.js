"use strict"

let config = require(`./config.json`)

let networkPath = `../networks/` + config.default_network
let genesisText = require(networkPath + `genesis.json`)
let genesis = JSON.parse(genesisText)
let networkName = genesis.chain_id

module.exports = {
  genesis,
  path: networkPath,
  name: networkName
}
