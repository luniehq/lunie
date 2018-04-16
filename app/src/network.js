let { join } = require("path")
let { readFileSync } = require("fs")
let config = require("./config.js")

// this network gets used if none is specified via the
// COSMOS_NETWORK env var
let DEFAULT_NETWORK = join(__dirname, "../networks/" + config.default_network)
let networkPath = process.env.COSMOS_NETWORK || DEFAULT_NETWORK

let genesisText = readFileSync(join(networkPath, "genesis.json"), "utf8")
let genesis = JSON.parse(genesisText)
let networkName = genesis.chain_id

module.exports = {
  path: networkPath,
  name: networkName
}
