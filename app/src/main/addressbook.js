const fs = require("fs-extra")
const { join } = require("path")
const axios = require("axios")
const url = require("url")

const LOGGING = JSON.parse(process.env.LOGGING || "true") !== false
const TENDERMINT_RPC_PORT = 26657
const FIXED_NODE = process.env.COSMOS_NODE

module.exports = class Addressbook {
  constructor(
    configPath,
    expectedNodeVersion,
    persistent_peers = [],
    onConnectionMessage = () => {}
  ) {
    this.peers = []
    this.expectedNodeVersion = expectedNodeVersion
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

  async ping(peerURL) {
    let pingURL = `http://${peerURL}:${TENDERMINT_RPC_PORT}`
    this.onConnectionMessage(`pinging node: ${pingURL}`)
    let nodeAlive = await axios
      .get(pingURL, { timeout: 3000 })
      .then(() => true, () => false)
    this.onConnectionMessage(
      `Node ${peerURL} is ${nodeAlive ? "alive" : "down"}`
    )
    return nodeAlive
  }

  async getVersion(peerURL) {
    let versionURL = `http://${peerURL}:${TENDERMINT_RPC_PORT}/node_version`
    LOGGING && console.log("Querying node version:", versionURL)
    let nodeVersion = await axios
      .get(versionURL, { timeout: 3000 })
      .then(res => res.data)
    LOGGING && console.log("Node version is", nodeVersion)
    return nodeVersion
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
    let availableNodes = this.peers.filter(node => node.state === "available")
    if (availableNodes.length === 0) {
      throw Error("No nodes available to connect to")
    }
    // pick a random node
    let curNode =
      availableNodes[Math.floor(Math.random() * availableNodes.length)]

    let nodeAlive = await this.ping(curNode.host)
    if (!nodeAlive) {
      this.flagNodeOffline(curNode.host)

      return this.pickNode()
    }

    let nodeVersion = await this.getVersion(curNode.host)
    if (this.expectedNodeVersion !== nodeVersion) {
      this.flagNodeIncompatible(curNode.host)

      return this.pickNode()
    }

    this.onConnectionMessage("Picked node: " + curNode.host)

    // we skip discovery for fixed nodes as we want to always return the same node
    if (!FIXED_NODE) {
      // remember the peers of the node and store them in the addressbook
      this.discoverPeers(curNode.host)
    }

    return curNode.host + ":" + TENDERMINT_RPC_PORT
  }

  flagNodeOffline(host) {
    this.peers.find(p => p.host === host).state = "down"
  }

  flagNodeIncompatible(host) {
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
    let subPeers = (await axios.get(
      `http://${peerIP}:${TENDERMINT_RPC_PORT}/net_info`
    )).data.result.peers
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
