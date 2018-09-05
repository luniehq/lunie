"use strict"

const Channel = require(`@nodeguy/channel`)
const fp = require("lodash/fp")
const gaiaLite = require(`../../../app/src/main/gaiaLite`)

const mockFunction = (done, vector) => async input => {
  if (vector.length === 0) {
    done(new Error(`Unexpected end of input in mock function.`))
    return
  }

  const [expectedInput, output] = vector.shift()

  if (input !== expectedInput) {
    done(new Error(`Input "${input}" !== "${expectedInput}" in mock function.`))
    return
  }

  if (output instanceof Error) {
    throw output
  } else {
    return output
  }
}

test(`random from pool`, async () => {
  const choose = pool => pool.length - 1

  const output = gaiaLite.bufferAndChoose({
    choose,
    input: Channel.from(fp.range(0, 10)),
    maximum: 5
  })

  expect(await output.values()).toEqual([5])
})

describe(`discoverResponsiveNodes`, () => {
  test(`return only responsive nodes`, async done => {
    const nodePeers = mockFunction(done, [
      [`1.2.3.4`, new Error()],
      [`5.6.7.8`, []]
    ])

    const nodes = gaiaLite.discoverResponsiveNodes({
      nodePeers,
      seeds: [`1.2.3.4`, `5.6.7.8`]
    })

    expect(await nodes.values()).toEqual([`5.6.7.8`])
    done()
  })

  test(`discover new peers`, async done => {
    const nodePeers = mockFunction(done, [
      [`1.2.3.4`, [`5.6.7.8`]],
      [`5.6.7.8`, [`9.10.11.12`]],
      [`9.10.11.12`, []]
    ])

    const nodes = await gaiaLite.discoverResponsiveNodes({
      nodePeers,
      seeds: [`1.2.3.4`]
    })

    expect(await nodes.values()).toEqual([`1.2.3.4`, `5.6.7.8`, `9.10.11.12`])
    done()
  })

  test(`return only the first 'maximum' nodes`, async done => {
    const nodePeers = mockFunction(done, [
      [`1.2.3.4`, [`5.6.7.8`]],
      [`5.6.7.8`, [`9.10.11.12`]],
      [`9.10.11.12`, []]
    ])

    const nodes = await gaiaLite.discoverResponsiveNodes({
      maximum: 2,
      nodePeers,
      seeds: [`1.2.3.4`]
    })

    expect(nodes).toEqual([`1.2.3.4`, `5.6.7.8`])
    done()
  })

  test(`don't query nodes more than once`, async done => {
    const nodePeers = mockFunction(done, [
      [`1.2.3.4`, [`5.6.7.8`]],
      [`5.6.7.8`, [`1.2.3.4`]]
    ])

    await gaiaLite.discoverResponsiveNodes({
      nodePeers,
      seeds: [`1.2.3.4`, `5.6.7.8`]
    })

    done()
  })

  test(`make simultaneous queries`, async done => {
    const nodePeers = async address => {
      if (address === `1.2.3.4`) {
        await new Promise(() => {})
      } else {
        done()
        return []
      }
    }

    await gaiaLite.discoverResponsiveNodes({
      nodePeers,
      seeds: [`1.2.3.4`, `5.6.7.8`],
      simultaneousQueries: 2
    })
  })

  test(`report progress`, async done => {
    const log = []

    const reportProgress = message => {
      log.push(message)
    }

    const nodePeers = mockFunction(done, [
      [`1.2.3.4`, [`5.6.7.8`]],
      [`5.6.7.8`, [`9.10.11.12`]],
      [`9.10.11.12`, []]
    ])

    await gaiaLite.discoverResponsiveNodes({
      nodePeers,
      reportProgress,
      seeds: [`1.2.3.4`]
    })

    expect(log).toEqual([
      `Querying node 1.2.3.4.`,
      `Querying node 5.6.7.8.`,
      `Querying node 9.10.11.12.`
    ])

    done()
  })
})

test(`nodeVersionCompatible`, () => {
  expect(gaiaLite.nodeVersionCompatible(`0.13.0`, `0.1.0`)).toEqual(false)
  expect(gaiaLite.nodeVersionCompatible(`0.13.0`, `0.13.2`)).toEqual(true)
})

test(`peersFromNodeResponse`, () => {
  const response = {
    jsonrpc: "2.0",
    id: "",
    result: {
      listening: true,
      listeners: ["Listener(@142.93.44.58:26656)"],
      n_peers: "2",
      peers: [
        {
          node_info: {
            id: "6f6d1ebed4e91503cf26dfb998ed36c26e46f8db",
            listen_addr: "35.147.99.12:26656",
            network: "gaia-8001",
            version: "0.23.0",
            channels: "40202122233038",
            moniker: "fullnode_frankfurt2",
            other: [
              "amino_version=0.12.0",
              "p2p_version=0.5.0",
              "consensus_version=v1/0.2.2",
              "rpc_version=0.7.0/3",
              "tx_index=on",
              "rpc_addr=tcp://0.0.0.0:26657"
            ]
          },
          is_outbound: false,
          connection_status: {
            Duration: "9223372036854775807",
            SendMonitor: {
              Active: true,
              Start: "2018-08-23T15:49:35.4Z",
              Duration: "19501120000000",
              Idle: "0",
              Bytes: "205783884",
              Samples: "97851",
              InstRate: "4350",
              CurRate: "26949",
              AvgRate: "10552",
              PeakRate: "348350",
              BytesRem: "0",
              TimeRem: "0",
              Progress: 0
            },
            RecvMonitor: {
              Active: true,
              Start: "2018-08-23T15:49:35.4Z",
              Duration: "19501080000000",
              Idle: "40000000",
              Bytes: "184732794",
              Samples: "85224",
              InstRate: "2750",
              CurRate: "23888",
              AvgRate: "9473",
              PeakRate: "305400",
              BytesRem: "0",
              TimeRem: "0",
              Progress: 0
            },
            Channels: [
              {
                ID: 48,
                SendQueueCapacity: "1",
                SendQueueSize: "0",
                Priority: "5",
                RecentlySent: "0"
              },
              {
                ID: 64,
                SendQueueCapacity: "1000",
                SendQueueSize: "0",
                Priority: "10",
                RecentlySent: "0"
              },
              {
                ID: 32,
                SendQueueCapacity: "100",
                SendQueueSize: "0",
                Priority: "5",
                RecentlySent: "13446"
              },
              {
                ID: 33,
                SendQueueCapacity: "100",
                SendQueueSize: "0",
                Priority: "10",
                RecentlySent: "21219"
              },
              {
                ID: 34,
                SendQueueCapacity: "100",
                SendQueueSize: "0",
                Priority: "5",
                RecentlySent: "92844"
              },
              {
                ID: 35,
                SendQueueCapacity: "2",
                SendQueueSize: "0",
                Priority: "1",
                RecentlySent: "24"
              },
              {
                ID: 56,
                SendQueueCapacity: "1",
                SendQueueSize: "0",
                Priority: "5",
                RecentlySent: "0"
              }
            ]
          }
        },
        {
          node_info: {
            id: "a28737ff02391a6e00a1d3b79befd57e68e8264c",
            listen_addr: "13.59.160.164:26656",
            network: "gaia-8001",
            version: "0.23.1",
            channels: "4020212223303800",
            moniker: "gaiaseeds_us_east_1b",
            other: [
              "amino_version=0.12.0",
              "p2p_version=0.5.0",
              "consensus_version=v1/0.2.2",
              "rpc_version=0.7.0/3",
              "tx_index=on",
              "rpc_addr=tcp://0.0.0.0:26657"
            ]
          },
          is_outbound: false,
          connection_status: {
            Duration: "9223372036854775807",
            SendMonitor: {
              Active: true,
              Start: "2018-08-23T21:02:24.82Z",
              Duration: "731700000000",
              Idle: "100000000",
              Bytes: "7930157",
              Samples: "3651",
              InstRate: "6170",
              CurRate: "25647",
              AvgRate: "10838",
              PeakRate: "294440",
              BytesRem: "0",
              TimeRem: "0",
              Progress: 0
            },
            RecvMonitor: {
              Active: true,
              Start: "2018-08-23T21:02:24.82Z",
              Duration: "731640000000",
              Idle: "60000000",
              Bytes: "9330711",
              Samples: "3326",
              InstRate: "4570",
              CurRate: "32096",
              AvgRate: "12753",
              PeakRate: "291450",
              BytesRem: "0",
              TimeRem: "0",
              Progress: 0
            },
            Channels: [
              {
                ID: 48,
                SendQueueCapacity: "1",
                SendQueueSize: "0",
                Priority: "5",
                RecentlySent: "0"
              },
              {
                ID: 64,
                SendQueueCapacity: "1000",
                SendQueueSize: "0",
                Priority: "10",
                RecentlySent: "0"
              },
              {
                ID: 32,
                SendQueueCapacity: "100",
                SendQueueSize: "0",
                Priority: "5",
                RecentlySent: "14527"
              },
              {
                ID: 33,
                SendQueueCapacity: "100",
                SendQueueSize: "0",
                Priority: "10",
                RecentlySent: "47604"
              },
              {
                ID: 34,
                SendQueueCapacity: "100",
                SendQueueSize: "0",
                Priority: "5",
                RecentlySent: "97889"
              },
              {
                ID: 35,
                SendQueueCapacity: "2",
                SendQueueSize: "0",
                Priority: "1",
                RecentlySent: "103"
              },
              {
                ID: 56,
                SendQueueCapacity: "1",
                SendQueueSize: "0",
                Priority: "5",
                RecentlySent: "0"
              }
            ]
          }
        }
      ]
    }
  }

  expect(gaiaLite.peersFromNodeResponse(response)).toEqual([
    `35.147.99.12`,
    `13.59.160.164`
  ])
})
