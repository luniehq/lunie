const fs = require("fs-extra")
const { join } = require("path")
const axios = require("axios")
const url = require("url")

const LOGGING = JSON.parse(process.env.LOGGING || "true") !== false
const FIXED_NODE = process.env.COSMOS_NODE

module.exports = class Addressbook {
  constructor(
    config,
    configPath,
    { persistent_peers = [], onConnectionMessage = () => {} } = {}
  ) {
    this.peers = []
    this.config = config
    this.onConnectionMessage = onConnectionMessage

    // if we define a fixed node, we skip persistence
    if (FIXED_NODE) {
      this.addPeer(FIXED_NODE)
      return
    }

    this.addressbookPath = join(configPath, "addressbook.json")
    this.loadFromDisc()

    // add persistent peers to already stored peers
    persistent_peers
      .filter(peer => !this.peerIsKnown(peer))
      .forEach(peer => this.addPeer(peer))

    if (persistent_peers.length > 0) {
      this.persistToDisc()
    }
  }

  peerIsKnown(peerURL) {
    // we only store the hostname as we want to set protocol and port ourselfs
    let peerHost = getHostname(peerURL)
    return this.peers.find(peer => peer.host.indexOf(peerHost) !== -1)
  }

  // adds the new peer to the list of peers
  addPeer(peerURL) {
    let peerHost = getHostname(peerURL)
    LOGGING && console.log("Adding new peer:", peerHost)
    this.peers.push({
      host: peerHost,
      // assume that new peers are available
      state: "available"
    })
  }

  loadFromDisc() {
    // if there is no address book file yet, there are no peers stored yet
    // the file will be created when persisting any peers to disc
    let exists = fs.existsSync(this.addressbookPath)
    if (!exists) {
      this.peers = []
      return
    }
    let content = fs.readFileSync(this.addressbookPath, "utf8")
    let peers = JSON.parse(content)
    this.peers = peers.map(host => ({
      host,
      state: "available"
    }))
  }

  persistToDisc() {
    let peers = this.peers
      // only remember available nodes
      .filter(p => p.state === "available")
      .map(p => p.host)
    fs.ensureFileSync(this.addressbookPath)
    fs.writeFileSync(this.addressbookPath, JSON.stringify(peers), "utf8")
  }

  // returns an available node or throws if it can't find any
  async pickNode() {
    let curNode

    if (FIXED_NODE) {
      // we skip discovery for fixed nodes as we want to always return the same
      // node
      curNode = { host: FIXED_NODE }
    } else {
      let availableNodes = this.peers.filter(node => node.state === "available")
      if (availableNodes.length === 0) {
        throw Error("No nodes available to connect to")
      }
      // pick a random node
      curNode =
        availableNodes[Math.floor(Math.random() * availableNodes.length)]

      try {
        await this.discoverPeers(curNode.host)
      } catch (exception) {
        console.warn(
          `Unable to discover peers from node ${require(`util`).inspect(
            curNode
          )}: ${exception}`
        )

        this.flagNodeOffline(curNode.host)
        return this.pickNode()
      }

      // remember the peers of the node and store them in the addressbook
      this.persistToDisc()
    }

    this.onConnectionMessage("Picked node: " + curNode.host)
    return curNode.host + ":" + this.config.default_tendermint_port
  }

  flagNodeOffline(nodeIP) {
    const host = nodeIP.split(":")[0]
    this.peers.find(p => p.host === host).state = "down"
  }

  flagNodeIncompatible(nodeIP) {
    const host = nodeIP.split(":")[0]
    this.peers.find(p => p.host === host).state = "incompatible"
  }

  resetNodes() {
    this.peers = this.peers.map(peer =>
      Object.assign({}, peer, {
        state: "available"
      })
    )
  }

  async discoverPeers(peerIP) {
    this.onConnectionMessage(`Querying node: ${peerIP}`)

    let subPeers = (await axios.get(
      `http://${peerIP}:${this.config.default_tendermint_port}/net_info`,
      { timeout: 3000 }
    )).data.result.peers

    this.onConnectionMessage(`Node ${peerIP} is alive.`)

    let subPeersHostnames = subPeers.map(peer => peer.node_info.listen_addr)

    subPeersHostnames
      // check if we already know the peer
      .filter(subPeerHostname => !this.peerIsKnown(subPeerHostname))
      // add new peers to state
      .forEach(subPeerHostname => {
        this.addPeer(subPeerHostname)
      })

    if (subPeersHostnames.length > 0) {
      this.persistToDisc()
    }
  }
}

function getHostname(peerURL) {
  // some urls like from peers do not have a protocol specified and are therefor not correctly parsed
  peerURL = peerURL.startsWith("http") ? peerURL : "http://" + peerURL
  peerURL = url.parse(peerURL)
  return peerURL.hostname
}
