const fs = require("fs-extra")
const { join, normalize } = require("path")
const axios = require("axios")
const url = require("url")

const TENDERMINT_RPC_PORT = 46657

module.exports = class Addressbook {
  constructor(configPath, persistent_peers = []) {
    this.addressbookPath = join(configPath, "addressbook.json")
    this.peers = []

    this.loadFromDisc()

    // add persistent peers to already stored peers
    persistent_peers
      .filter(peer => !this.peerIsKnown(peer))
      .forEach(peer => this.addPeer(peer))

    this.persistToDisc()
  }

  async ping(peerURL) {
    let pingURL = `http://${peerURL}:${TENDERMINT_RPC_PORT}`
    console.log("Pinging node:", pingURL)
    let nodeAlive = await axios
      .get(pingURL, { timeout: 3000 })
      .then(() => true, () => false)
    console.log("Node", peerURL, "is", nodeAlive ? "alive" : "down")
    return nodeAlive
  }

  peerIsKnown(peerURL) {
    // we only store the hostname as we want to set protocol and port ourselfs
    let peerHost = getHostname(peerURL)
    return this.peers.find(peer => peer.host.indexOf(peerHost) !== -1)
  }

  // adds the new peer to the list of peers
  addPeer(peerURL) {
    let peerHost = getHostname(peerURL)
    console.log("Adding new peer:", peerHost)
    this.peers.push({
      host: peerHost,
      // assume that new peers are available
      state: "available"
    })
  }

  loadFromDisc() {
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

    console.log("Picked node:", curNode.host)

    // remember the peers of the node and store them in the addressbook
    this.discoverPeers(curNode.host)

    return curNode.host + ":" + TENDERMINT_RPC_PORT
  }

  flagNodeOffline(host) {
    this.peers.find(p => p.host === host).state = "down"
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

    this.persistToDisc()
  }
}

function getHostname(peerURL) {
  // some urls like from peers do not have a protocol specified and are therefor not correctly parsed
  peerURL = peerURL.startsWith("http") ? peerURL : "http://" + peerURL
  peerURL = url.parse(peerURL)
  return peerURL.hostname
}
