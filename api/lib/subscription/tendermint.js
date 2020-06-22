const Sentry = require('@sentry/node')
const WebSocket = require('ws')

function convertWsArgs(args = {}) {
  for (const key in args) {
    const value = args[key]
    if (typeof value === `number`) {
      args[key] = String(value)
    } else if (Buffer.isBuffer(value)) {
      args[key] = `0x` + value.toString(`hex`)
    } else if (value instanceof Uint8Array) {
      args[key] = `0x` + Buffer.from(value).toString(`hex`)
    }
  }
  return args
}

class Client {
  constructor(networkId, uriString) {
    this.networkId = networkId
    this.websocket = true
    this.uri = uriString
    this.closed = true

    // Keep track of subscription calls so we can call them again in case of disconnection
    this.subscriptions = []

    this.connectWs()
  }

  async connectWs(attempt = 0) {
    if (attempt > 0) {
      console.log(
        `\x1b[36mretry connection (attempt ${attempt}/5) for network ${this.networkId}\x1b[0m`
      )
      // Retry connection after waiting period of 5s multiplied by attempt count
      await new Promise((resolve) =>
        setTimeout(() => resolve(), 5000 * attempt)
      )
    }

    this.ws = new WebSocket(this.uri)

    this.ws.onopen = () => {
      this.closed = false

      if (this.subscriptions.length > 0) {
        this.subscriptions.forEach(({ args, listener }) => {
          this.subscribe(args, listener)
        })
      }
    }

    this.ws.onerror = (error) => {
      console.error(
        `\x1b[36mwebsocket connection lost for network ${this.networkId}\x1b[0m`,
        error.message
      )

      // only log to Sentry if retry fails 5 times in a row
      if (attempt === 5) Sentry.captureException(error)
    }

    this.ws.onmessage = (result) => {
      const data = JSON.parse(result.data)
      if (!data.id || !data.result || Object.keys(data.result).length === 0)
        return

      const subscription = this.subscriptions.find(({ id }) => id === data.id)
      if (!subscription) return
      subscription.resolve(data.result)
      subscription.listener(data.result)
    }

    this.ws.onerror = () => {
      // Disconnect happens after an error which is handled by the error event and logged with Sentry

      if (this.closed || attempt >= 5) {
        // Accept disconnection and don't retry connection again
        console.log(
          `\x1b[31mwebsocket disconnected for network ${this.networkId}\x1b[0m`
        )
        return
      }
      this.connectWs(attempt + 1)
    }
  }

  subscribe(args, listener) {
    const self = this

    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36)

      // Store every call
      self.subscriptions.push({
        id,
        args,
        listener,
        resolve,
        reject
      })

      if (this.closed) return

      const params = convertWsArgs(args)

      if (typeof listener !== `function`) {
        throw Error(`Must provide listener function`)
      }

      this.ws.send(
        JSON.stringify({ jsonrpc: `2.0`, id, method: 'subscribe', params })
      )
    })
  }

  close() {
    this.closed = true
    if (!this.ws) return
    this.ws.close()
  }
}

module.exports = Client
