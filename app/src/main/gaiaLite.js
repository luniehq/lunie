"use strict"

const semver = require(`semver`)
const _ = require(`lodash`)

const discoverResponsiveNodes = async ({
  // the maximum number of nodes to return
  maximum = 100,

  // an async function that returns the peers of a node
  nodePeers,

  // a callback for reporting progress
  reportProgress = () => {},

  // an array of seed nodes to query
  seeds,

  // the number of simultaneous queries we're allowed to make
  simultaneousQueries = 10
}) => {
  const queue = Array.from(seeds)
  const responsiveNodes = []
  const seenBefore = new Set()

  await Promise.all(
    _.range(simultaneousQueries).map(async () => {
      while (responsiveNodes.length < maximum && queue.length > 0) {
        const node = queue.shift()

        if (!seenBefore.has(node)) {
          seenBefore.add(node)
          let peers
          reportProgress(`Querying node ${node}.`)

          try {
            peers = await nodePeers(node)
          } catch (exception) {
            console.log(`Node ${node} didn't respond.`)
            continue
          }

          responsiveNodes.push(node)
          queue.push(...peers)
        }
      }
    })
  )

  return responsiveNodes
}

const nodeVersionCompatible = (expected, actual) => {
  const diff = semver.diff(actual, expected)
  return diff === `patch` || diff === null
}

const peersFromNodeResponse = ({ result: { peers } }) =>
  peers.map(({ node_info: { listen_addr } }) => listen_addr.split(`:`)[0])

module.exports = {
  discoverResponsiveNodes,
  nodeVersionCompatible,
  peersFromNodeResponse
}
