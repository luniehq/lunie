let axios = require('axios')
let write = require('fs').writeFileSync
let { tmpdir } = require('os')
let { join } = require('path')
let mkdirp = require('mkdirp').sync
let runDev = require('./runner.js')

async function get (url) {
  let res = await axios.request({
    url,
    transformResponse: (res) => res,
    responseType: 'text'
  })
  return res.data
}

async function main () {
  let network = process.argv[2] || 'gaia-1'

  if (network === 'local') {
    runDev('./app/networks/local')
  } else {
    // fetch genesis.json and config.toml from github testnets repo,
    // save to tmp dir and pass to app dev runner
    console.log(`fetching genesis for network "${network}"`)
    let genesisJson = await get(`https://github.com/tendermint/testnets/raw/master/${network}/gaia/genesis.json`)
    .catch(e => {
      throw new Error(`Can't load genesis.json: ${e.message}`)
    })
    let configToml = await get(`https://github.com/tendermint/testnets/raw/master/${network}/gaia/config.toml`)
    .catch(e => {
      throw new Error(`Can't load config.toml: ${e.message}`)
    })
    let path = join(tmpdir(), Math.random().toString(36).slice(2))
    mkdirp(path)
    write(join(path, 'genesis.json'), genesisJson)
    write(join(path, 'config.toml'), configToml)
    runDev(path)
  }
}

main().catch(function (err) { throw err })
