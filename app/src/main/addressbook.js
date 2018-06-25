const fs = require("fs-extra")
const { join } = require("path")
const axios = require("axios")
const url = require("url")

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
    console.log("Pinging node:", peerURL)
    return axios
      .get("http://" + peerURL, { timeout: 3000 })
      .then(() => true, () => false)
  }

  // check for substr as we prefix found urls with http for consistency and incoming peer urls could not have http
  peerIsKnown(peerURL) {
    let peerHost = url.parse(peerURL).hostname
    return this.peers.find(peer => peer.ip.indexOf(peerHost) !== -1)
  }

  // adds the new peer to the list of peers
  addPeer(peerURL) {
    peerURL = url.parse(peerURL)
    let formatedURL = url.format({
      protocol: "",
      port: 46657,
      hostname: peerURL.hostname
    })
    this.peers.push({
      ip: formatedURL,
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
    let ips = JSON.parse(content)
    this.peers = ips.map(ip => ({
      ip,
      state: "available"
    }))
  }

  persistToDisc() {
    let ips = this.peers
      // only remember available nodes
      .filter(p => p.state === "available")
      .map(p => p.ip)
    fs.ensureFileSync(this.addressbookPath)
    fs.writeFileSync(this.addressbookPath, JSON.stringify(ips), "utf8")
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

    let nodeAlive = await this.ping(curNode.ip)
    if (!nodeAlive) {
      this.flagNodeOffline(curNode.ip)

      return this.pickNode()
    }

    // remember the peers of the node and store them in the addressbook
    this.discoverPeers(curNode.ip)

    return curNode.ip
  }

  flagNodeOffline(ip) {
    this.peers.find(p => p.ip === ip).state = "down"
  }

  flagNodeIncompatible(ip) {
    this.peers.find(p => p.ip === ip).state = "incompatible"
  }

  resetNodes() {
    nodes = nodes.map(node =>
      Object.assign({}, node, {
        state: "available"
      })
    )
  }

  async discoverPeers(peerIP) {
    let subPeers = (await axios.get(peerIP + "/net_info")).data.result.peers
    let subPeersIPs = subPeers.map(peer => peer.node_info.listen_addr)

    subPeersIPs
      // check if we already know the peer
      .filter(subPeerIP => !this.peerIsKnown(subPeerIP))
      // prefix ip so url parser understands it as an url
      .map(subPeerIP => "http://" + subPeerIP)
      // add new peers to state
      .forEach(subPeerIP => {
        this.addPeer(subPeerIP)
      })
  }
}
