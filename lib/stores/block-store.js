class BlockStore {
  constructor(network, database) {
    this.network = network
    this.latestHeight = 0
    this.block = {}
    this.stakingDenom = ''
    this.annualProvision = 0
    this.signedBlocksWindow = 0
    this.validators = {}
    this.proposals = []
    this.db = database

    // system to stop queries to proceed if store data is not yet available
    this.resolveReady
    this.dataReady = new Promise(resolve => {
      this.resolveReady = resolve
    })
  }

  update({
    height,
    block = this.block,
    validators = this.validators,
    data = this.data // multi purpose block to be used for any chain specific data
  }) {
    this.latestHeight = Number(height)
    this.block = block
    this.validators = validators
    this.data = data

    // when the data is available signal readyness so the resolver stop blocking the requests
    this.resolveReady()
  }
}

module.exports = BlockStore
