"use strict"

const { join, resolve } = require(`path`)
const { buildNodes } = require(`./build/local/helper`)
const appDir = resolve(`${__dirname}/../`)
const buildTestnetPath = join(appDir, `builds`, `testnets`)

async function main() {
  const network = process.argv[2] || `local-testnet`
  const numberNodes = parseInt(process.argv[3], 10) || 1

  await buildNodes(
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
}

main()
