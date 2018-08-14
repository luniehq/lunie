const os = require("os")

const { cli } = require(`@nodeguy/cli`)
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
  if (options.overwrite) {
    out = await makeExec(
      "rm -r builds/testnets/local-testnet; mkdir builds/testnets/local-testnet"
    )
  } else {
    out = await makeExec("mkdir builds/testnets/local-testnet")
  }
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
    `sed -i.bak 's/index_all_tags = true/index_all_tags = false/g' ./builds/testnets/local-testnet/config.toml`
  )
  out && console.log(out)

  out = await makeExec(
    `./builds/Gaia/${environment}/gaiad version > ./builds/testnets/local-testnet/gaiaversion.txt`
  )
  out && console.log(out)
}

function init(options, environment) {
  return new Promise((resolve, reject) => {
    let command = `builds/Gaia/${environment}/gaiad init --home ~/.gaiad-testnet --name local`
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
