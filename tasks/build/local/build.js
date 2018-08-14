const os = require("os")
const fs = require("fs-extra")
const { cli } = require(`@nodeguy/cli`)
var path = require("path")
const homeDir = require("os").homedir()
const appDir = path.resolve(__dirname + "/../../../")

let { spawn, exec } = require("child_process")

const optionsSpecification = {
  overwrite: ["overwrite ~/.gaiad-testnet/", false],
  password: ["custom password, default is 12345678", 12345678]
}

cli(optionsSpecification, async options => {
  const platform = os.platform()
  const environment =
    platform === "darwin"
      ? "darwin_amd64"
      : platform === "win32"
        ? "windows_amd64"
        : "linux_amd64"
  try {
    const secret = await init(options, environment)
    await moveFiles(options, environment)
    console.log("\n    🎉  SUCCESS 🎉\n")
    console.log(
      `To begin your local node please run:
  ./builds/Gaia/${environment}/gaiad start --home ~/.gaiad-testnet

To begin Voyager please run:
  yarn start local-testnet

Your secret is:
${secret}
`
    )
  } catch (error) {
    console.log("Encountered an Error:")
    console.error(error.msg ? error : error.toString())
  }
})

function makeExec(command) {
  console.log("$ " + command)
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
  if (
    options.overwrite &&
    fs.existsSync(appDir + "/builds/testnets/local-testnet")
  ) {
    out = await makeExec("rm -r builds/testnets/local-testnet")
    out && console.log(out)
  }

  out = await makeExec("mkdir builds/testnets/local-testnet")
  out && console.log(out)
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
    if (options.overwrite && fs.existsSync(homeDir + "/.gaiad-testnet")) {
      let out = await makeExec(`rm -r ${homeDir}/.gaiad-testnet`)
      out && console.log(out)
    }

    let command = `builds/Gaia/${environment}/gaiad init --home ${homeDir}/.gaiad-testnet --name local`
    if (options.overwrite) {
      command += " -o --owk"
    }
    console.log("$ " + command)
    const localnodeProcess = spawn(command, { shell: true })
    localnodeProcess.stdout.on("data", data => {
      let dataJson = JSON.parse(data.toString())
      resolve(dataJson.app_message.secret)
    })
    localnodeProcess.stdin.write(`${options.password}\n`)
    localnodeProcess.stderr.on("data", reject)
    localnodeProcess.once("exit", reject)
  })
}
