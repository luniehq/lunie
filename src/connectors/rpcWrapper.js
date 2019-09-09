"use strict"

const camel = require(`camelcase`)

export default function tendermintConnect() {
  const client = {
    socket: undefined,
    subscriptions: [],
    isConnected() {
      return this.socket && this.socket.readyState === WebSocket.OPEN
    },
    async disconnect() {
      await this.unsubscribeAll()
      this.subscriptions = []
      this.socket.close()
    },
    async connect(websocketEndpoint) {
      // if we have an existing connection, first disconnect that one
      if (this.isConnected()) {
        this.disconnect()
      }

      try {
        const socket = await connect(websocketEndpoint)
        this.socket = socket
      } catch (error) {
        throw error
      }

      this.socket.onmessage = function(event) {
        let { id: eventId, error, result } = JSON.parse(event.data)
        const isSubscriptionEvent = eventId.indexOf("#event") !== -1
        if (isSubscriptionEvent) {
          eventId = eventId.replace("#event", "")
        }

        const subscription = this.subscriptions.find(({ id }) => eventId === id)
        if (subscription) {
          if (isSubscriptionEvent) {
            subscription.callback(result.data.value)
            return
          }

          if (error) {
            subscription.reject(error)
          }
          subscription.resolve(result)

          // remove single subscription
          if (subscription.method !== "subscribe") {
            this.subscriptions = this.subscriptions.filter(
              ({ id }) => eventId !== id
            )
          }
        }
      }.bind(this)

      this.subscriptions.forEach(subscription =>
        this.startSubscription(subscription)
      )
    },
    subscribe(args, callback, method = "subscribe") {
      const id = Math.random().toString(36)
      const parameters = convertWsArgs(args)

      return new Promise((resolve, reject) => {
        const subscription = {
          id,
          method,
          parameters,
          callback,
          resolve,
          reject
        }
        this.subscriptions.push(subscription)

        if (this.isConnected()) {
          this.startSubscription(subscription)
        }
      })
    },
    startSubscription({ id, method, parameters }) {
      this.socket.send(
        JSON.stringify({
          jsonrpc: `2.0`,
          id,
          method,
          params: parameters
        })
      )
    }
  }

  for (const name of tendermintMethods) {
    client[camel(name)] = function(args) {
      return client.subscribe(args, undefined, name)
    }
  }

  return client
}

async function connect(websocketEndpoint) {
  const websocketHost = getHost(websocketEndpoint)
  const https = websocketEndpoint.startsWith(`https`)

  const socket = new WebSocket(
    `${https ? `wss` : `ws`}://${websocketHost}/websocket`
  )

  await new Promise((resolve, reject) => {
    socket.onopen = resolve
    socket.onclose = reject
  })

  return socket
}

function getHost(url) {
  return url.startsWith(`http`) && url.indexOf(`//`) !== -1
    ? url.split(`//`)[1]
    : url
}

const tendermintMethods = [
  `unsubscribe`,
  `unsubscribe_all`,

  `status`,
  `net_info`,
  `dial_peers`,
  `dial_seeds`,
  `blockchain`,
  `genesis`,
  `health`,
  `block`,
  `block_results`,
  `blockchain`,
  `validators`,
  `consensus_state`,
  `dump_consensus_state`,
  `broadcast_tx_commit`,
  `broadcast_tx_sync`,
  `broadcast_tx_async`,
  `unconfirmed_txs`,
  `num_unconfirmed_txs`,
  `commit`,
  `tx`,
  `tx_search`,

  `abci_query`,
  `abci_info`,

  `unsafe_flush_mempool`,
  `unsafe_start_cpu_profiler`,
  `unsafe_stop_cpu_profiler`,
  `unsafe_write_heap_profile`
]

function convertWsArgs(args = {}) {
  for (const k in args) {
    const v = args[k]
    if (typeof v === `number`) {
      args[k] = String(v)
    } else if (Buffer.isBuffer(v)) {
      args[k] = `0x` + v.toString(`hex`)
    } else if (v instanceof Uint8Array) {
      args[k] = `0x` + Buffer.from(v).toString(`hex`)
    }
  }
  return args
}
