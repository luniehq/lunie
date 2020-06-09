const EventEmitter = require(`events`)
const Sentry = require('@sentry/node')
const url = require(`url`)
const websocket = require(`websocket-stream`)
const ndjson = require(`ndjson`)
const pumpify = require(`pumpify`).obj

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

class Client extends EventEmitter {
  constructor(networkId, uriString = `localhost:26657`) {
    super()

    // parse full-node URI
    let { protocol, hostname, port } = url.parse(uriString)

    // default port
    if (!port) {
      port = 26657
    }

    this.networkId = networkId
    this.websocket = true
    this.uri = `${protocol}//${hostname}:${port}/websocket`

    // Keep track of subscription calls so we can call them again in case of disconnection
    this.subscriptions = []

    this.call = this.callWs
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

    this.ws = pumpify(ndjson.stringify(), websocket(this.uri))

    if (this.subscriptions.length > 0) {
      this.subscriptions.forEach(({ method, args, listener }) => {
        this.call(method, args, listener)
      })
    }
    this.ws.on(`error`, (error) => {
      console.error(
        `\x1b[36mwebsocket connection lost for network ${this.networkId}\x1b[0m`
      )

      // only log to Sentry if retry fails 5 times in a row
      if (attempt === 5) Sentry.captureException(error)
    })
    this.ws.on(`close`, () => {
      // Disconnect happens after an error which is handled by the error event and logged with Sentry

      if (this.closed || attempt >= 5) {
        // Accept disconnection and don't retry connection again
        console.log(
          `\x1b[31mwebsocket disconnected for network ${this.networkId}\x1b[0m`
        )
        return
      }
      this.connectWs(attempt + 1)
    })
    this.ws.on(`data`, (data) => {
      data = JSON.parse(data)
      if (!data.id) return
      this.emit(data.id, data.error, data.result)
    })
  }

  callWs(method, args, listener) {
    const self = this

    // Store every call
    self.subscriptions.push({
      method,
      args,
      listener
    })

    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36)
      const params = convertWsArgs(args)

      if (method !== `subscribe`) {
        throw Error(`Only the subscribe method is supported`)
      }

      if (typeof listener !== `function`) {
        throw Error(`Must provide listener function`)
      }

      // events get passed to listener
      this.on(id + `#event`, (err, res) => {
        if (err) return self.emit(`error`, err)
        listener(res.data.value)
      })

      // promise resolves on successful subscription or error
      this.on(id, (err) => {
        if (err) return reject(err)
        resolve()
      })

      this.ws.write({ jsonrpc: `2.0`, id, method, params })
    })
  }

  close() {
    this.closed = true
    if (!this.ws) return
    this.ws.destroy()
  }
}

module.exports = Client
