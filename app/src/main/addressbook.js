const fs = require("fs-extra")
const { join } = require("path")
const axios = require("axios")

module.exports = class Addressbook {
  constructor(configPath, persistent_peers = []) {
    this.addressbookPath = join(configPath, "addressbook.json")
    this.peers = []

    this.loadFromDisc()

    // add persistent peers to already stored peers
    persistent_peers.forEach(ip => {
      if (!this.peers.find(p => p.ip === ip)) {
        this.addPeer(this.peers, ip)
      }
    })

    this.persistToDisc()
  }

  async ping(nodeIP) {
    return axios
      .get("http://" + nodeIP, { timeout: 3000 })
      .then(() => true, () => false)
  }

  // adds the new peer to a list of peers
  // mutates the list of peers
  addPeer(peerList, peerIP) {
    peerList.push({
      ip: peerIP,
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

  // hops defines how deep peers of peers are scanned
  async discoverNodes(hops = 1, peerIPs = this.peers.map(p => p.ip)) {
    await peerIPs
      // get peers of all available nodes
      .filter(async peerIP => await this.ping(peerIP))
      // XXX race condition?
      // get peers of peer
      .forEach(async peer => {
        let subPeersIPs = (await axios.get(peer + "/net_info/peers")).data

        // check if we already know the peer
        let newPeerIPs = subPeersIPs.filter(
          subPeerIP => !this.peers.find(peer => peer.ip === subPeerIP)
        )

        // add new peers to state
        newPeerIPs.forEach(subPeerIP => {
          this.addPeer(peerIPs, subPeerIP)
        })

        // discover peers of peers
        if (hops > 1) {
          peerIPs = await this.discoverNodes(hops - 1, newPeerIPs)
        }
      })
  }
}
