"use strict"

const os = require(`os`)
const fs = require(`fs-extra`)
const { cli } = require(`@nodeguy/cli`)
const path = require(`path`)
const homeDir = require(`os`).homedir()
const appDir = path.resolve(__dirname + `/../../../`)

let { spawn, exec } = require(`child_process`)

const optionsSpecification = {
  overwrite: [`overwrite ~/.gaiad-testnet/`, false],
  password: [`custom password, default is 1234567890`, 1234567890]
}

cli(optionsSpecification, async options => {
  const platform = os.platform()
  const environment =
    platform === `darwin`
      ? `darwin_amd64`
      : platform === `win32`
        ? `windows_amd64`
        : `linux_amd64`
  try {
    // remove existing config
    if (options.overwrite) {
      if (fs.existsSync(appDir + `/builds/testnets/local-testnet`)) {
        let out = await makeExec(`rm -r builds/testnets/local-testnet`)
        out && console.log(out)
      }
      if (fs.existsSync(homeDir + `/.gaiad-testnet`)) {
        let out = await makeExec(`rm -r ~/.gaiad-testnet`)
        out && console.log(out)
      }
      if (fs.existsSync(homeDir + `/.cosmos-voyager-dev/local-testnet`)) {
        let out = await makeExec(`rm -r ~/.cosmos-voyager-dev/local-testnet`)
        out && console.log(out)
      }
    }

    await init(options, environment)
    const { address } = await createKey(options, environment)
    await initGenesis(options, environment, address)
    await moveFiles(options, environment)
    console.log(`\n    🎉  SUCCESS 🎉\n`)
    console.log(
      `To start Voyager with a local node please run:
  yarn start local-testnet

Default account:
  username: 'local'
  password: '1234567890'
`
    )
  } catch (error) {
    console.log(`Encountered an Error:`)
    console.error(error.msg ? error : error.toString())
  }
})

function makeExec(command) {
  console.log(`$ ` + command)
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (err) return reject(err)
      if (stderr) return reject(stderr)
      resolve(stdout)
    })
  })
}
async function moveFiles(options, environment) {
  let out
  fs.ensureDirSync(`builds/testnets/local-testnet`)

  out = await makeExec(
    `cp ~/.gaiad-testnet/config/{genesis.json,config.toml} builds/testnets/local-testnet/`
  )
  out && console.log(out)

  out = await makeExec(
    `sed -i.bak 's/seeds = ""/seeds = "localhost"/g' ./builds/testnets/local-testnet/config.toml`
  )
  out && console.log(out)

  out = await makeExec(
    `sed -i.bak 's/index_all_tags = false/index_all_tags = true/g'  ${homeDir}/.gaiad-testnet/config/config.toml`
  )
  out && console.log(out)

  out = await makeExec(
    `./builds/Gaia/${environment}/gaiad version > ./builds/testnets/local-testnet/gaiaversion.txt`
  )
  out && console.log(out)
}

function init(options, environment) {
  return new Promise(async (resolve, reject) => {
    let command = `builds/Gaia/${environment}/gaiad init --home ${homeDir}/.gaiad-testnet --moniker local --chain-id local-testnet`
    if (options.overwrite) {
      command += ` -o`
    }
    console.log(`$ ` + command)
    const localnodeProcess = spawn(command, { shell: true })
    localnodeProcess.stdin.write(`${options.password}\n`)
    localnodeProcess.stderr.pipe(process.stderr)
    localnodeProcess.once(`exit`, code => {
      code === 0 ? resolve() : reject()
    })
  })
}

function createKey(options, environment) {
  return new Promise(async (resolve, reject) => {
    let command = `builds/Gaia/${environment}/gaiacli keys add local --home ./builds/testnets/local-testnet/lcd -o json`
    console.log(`$ ` + command)
    const child = spawn(command, { shell: true })

    child.stdin.write(`${options.password}\n`)
    child.stdin.write(`${options.password}\n`)

    child.stdout.once(`data`, data => {
      resolve(JSON.parse(data))
    })

    child.once(`exit`, code => {
      code !== 0 && reject()
    })
  })
}

async function initGenesis(options, environment, address) {
  const genesisLocation = path.join(
    homeDir,
    `.gaiad-testnet/config`,
    `genesis.json`
  )
  let genesis = fs.readJSONSync(genesisLocation)
  genesis.app_state.accounts = [
    {
      address,
      coins: [
        {
          denom: `steak`,
          amount: `150`
        },
        {
          denom: `localcoin`,
          amount: `1000`
        }
      ]
    }
  ]
  fs.writeJSONSync(genesisLocation, genesis)

  await new Promise((resolve, reject) => {
    const child = spawn(`builds/Gaia/${environment}/gaiad`, [
      `gentx`,
      `--name`,
      `local`,
      `--home`,
      path.join(homeDir, `.gaiad-testnet`),
      `--home-client`,
      `./builds/testnets/local-testnet/lcd`
    ])
    child.stderr.pipe(process.stderr)
    child.stdin.write(`${options.password}\n`)
    child.once(`exit`, code => {
      code === 0 ? resolve() : reject()
    })
  })

  exec(
    `builds/Gaia/${environment}/gaiad collect-gentxs --home ${path.join(
      homeDir,
      `.gaiad-testnet`
    )}`
  )
}
