"use strict"

const { join, resolve } = require(`path`)
const { buildLocalTestnet } = require(`./helpers`)
const { getNodeId, startLocalNode } = require(`../gaia`)
const appDir = resolve(`${__dirname}/../../`)
const buildTestnetPath = join(appDir, `builds`, `testnets`)

async function main() {
  const network = `local-testnet`
  const numberNodes = parseInt(process.argv[2], 10) || 1
  const skipRebuild = process.argv[3] === `skip-rebuild`
  const targetDir = join(buildTestnetPath, network)

  if (skipRebuild) {
    const nodeHomePrefix = join(targetDir, `node_home`)

    const nodeOneId = await getNodeId(nodeHomePrefix + `_1`)
    for (let i = 1; i < numberNodes + 1; i++) {
      const home = `${nodeHomePrefix}_${i}`
      startLocalNode(home, i, nodeOneId)
    }
  } else {
    await buildLocalTestnet(targetDir, numberNodes, {
      chainId: network,
      overwrite: true,
      moniker: `local`
    })
  }
}

main().catch(function(error) {
  console.error(`Starting the application failed`, error)
})
