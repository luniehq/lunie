"use strict"

const fs = require(`fs-extra`)
const { join, resolve } = require(`path`)
const { startNodes, buildNodes } = require(`./build/local/helper`)
const appDir = resolve(`${__dirname}/../`)
const buildTestnetPath = join(appDir, `builds`, `testnets`)

async function main() {
  const network = `local-testnet`
  const numberNodes = parseInt(process.argv[2], 10) || 1

  const { cliHomePrefix, nodes, mainAccountSignInfo } = await buildNodes(
    join(buildTestnetPath, network),
    {
      chainId: network,
      password: `1234567890`,
      overwrite: false,
      moniker: `local`,
      keyName: `main-account`
    },
    numberNodes
  )
  await startNodes(nodes, mainAccountSignInfo, network)
  fs.copySync(join(nodes[1].home, `config`), cliHomePrefix)
  let { version } = require(`../package.json`)
  fs.writeFileSync(`${cliHomePrefix}/app_version`, version)
}

main().catch(function(error) {
  console.error(`Starting the application failed`, error)
})
