"use strict"
const buildLocalNode = require(`./helper`).buildLocalNode
const { cli } = require(`@nodeguy/cli`)
const path = require(`path`)

const appDir = path.resolve(`${__dirname}/../../`)
const buildTestnetPath = `${appDir}/builds/testnets`

const optionsSpecification = {
  overwrite: [`overwrite ~/.gaiad-testnet/`, false],
  password: [`custom password, default is 1234567890`, 1234567890],
  numberNodes: [`number of validators in the network`, 1],
  moniker: [`The prefix for each node in your network`, `local`],
  chainId: [`Chain name you want to create`, `default-testnet`],
  keyName: [`Main account to operate`, `username`]
}

cli(optionsSpecification, buildLocalNode(buildTestnetPath))
