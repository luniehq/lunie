let axios = require("axios")
let write = require("fs").writeFileSync
let read = require("fs").readFileSync
let { tmpdir } = require("os")
let { join } = require("path")
let mkdirp = require("mkdirp").sync
let runDev = require("./runner.js")

let genesisJson = read("./app/networks/gaia-5000/genesis.json")
let configToml = read("./app/networks/gaia-5000/config.toml")
let basecoindversionTxt = read("./app/networks/gaia-5000/basecoindversion.txt")

async function get(url) {
  let res = await axios.request({
    url,
    transformResponse: res => res,
    responseType: "text"
  })
  return res.data
}

async function main() {
  const network = process.argv[2] || "gaia-5000"

  /*
  // fetch genesis.json and config.toml from github testnets repo,
  // save to tmp dir and pass to app dev runner
  console.log(`fetching genesis for network "${network}"`)
  const genesisJson = await get(
    `https://github.com/tendermint/testnets/raw/master/${network}/config/genesis.json`
  ).catch(e => {
    throw new Error(`Can't load genesis.json: ${e.message}`)
  })
  const configToml = await get(
    `https://github.com/tendermint/testnets/raw/master/${network}/config/config.toml`
  ).catch(e => {
    throw new Error(`Can't load config.toml: ${e.message}`)
  })
  const gaiaVersionTxt = await get(
    `https://github.com/tendermint/testnets/raw/master/${network}/basecoindversion.txt`
  ).catch(e => {
    throw new Error(`Can't load config.toml: ${e.message}`)
  })
  */
  const path = join(
    tmpdir(),
    Math.random()
      .toString(36)
      .slice(2)
  )
  mkdirp(path)
  write(join(path, "genesis.json"), genesisJson)
  write(join(path, "config.toml"), configToml)
  write(join(path, "basecoindversion.txt"), basecoindversionTxt)

  // run Voyager in a development environment
  runDev(path)
}

main().catch(function(err) {
  console.error("Starting the application failed", err)
})
