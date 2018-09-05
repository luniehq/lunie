"use strict"

const Channel = require(`@nodeguy/channel`)
const fp = require("lodash/fp")
const semver = require(`semver`)

// Buffer up to `maximum` values from a channel
const bufferAndChoose = ({ choose, input, maximum }) => {
  const output = Channel()

  // Keep filling the pool with new values from `input`.
  ;(async () => {
    const pool = []

    do {
      const value = await input.shift()

      if (value !== undefined) {
        pool.push(value)
      }

      if (value === undefined || pool.length === maximum) {
        const index = choose(pool)
        await output.push(pool[index])
        pool.splice(index, 1)
      }
    } while (pool.length > 0)

    await output.close()
  })()

  return output
}

// Return a channel of node addresses.
const discoverResponsiveNodes = ({
  // an async function that returns the peers of a node
  nodePeers,

  // a callback for reporting progress
  reportProgress = () => {},

  // an array of seed nodes to query
  seeds,

  // the number of simultaneous queries we're allowed to make
  simultaneousQueries = 10
}) => {
  const responsiveNodes = Channel()

  // Report the responsive nodes asynchronously.
  ;(async () => {
    const queue = Array.from(seeds)
    const seenBefore = new Set()

    await Promise.all(
      fp.range(0, simultaneousQueries).map(async () => {
        while (queue.length > 0) {
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

            await responsiveNodes.push(node)
            queue.push(...peers)
          }
        }
      })
    )

    await responsiveNodes.close()
  })()

  return responsiveNodes
}

const nodeVersionCompatible = (expected, actual) => {
  const diff = semver.diff(actual, expected)
  return diff === `patch` || diff === null
}

const peersFromNodeResponse = ({ result: { peers } }) =>
  peers.map(({ node_info: { listen_addr } }) => listen_addr.split(`:`)[0])

module.exports = {
  bufferAndChoose,
  discoverResponsiveNodes,
  nodeVersionCompatible,
  peersFromNodeResponse
}
