class BlockStore {
  constructor(network) {
    this.network = network
    this.latestHeight = 0
    this.block = {}
    this.stakingDenom = ''
    this.annualProvision = 0
    this.signedBlocksWindow = 0
    this.validators = {}

    // system to stop queries to proceed if store data is not yet available
    this.resolveReady
    this.dataReady = new Promise(resolve => {
      this.resolveReady = resolve
    })
  }

  update({
    height,
    block = this.block,
    stakingDenom = this.stakingDenom,
    annualProvision = this.annualProvision,
    signedBlocksWindow = this.signedBlocksWindow,
    validators = this.validators
  }) {
    this.latestHeight = Number(height)
    this.block = block
    this.stakingDenom = stakingDenom
    this.annualProvision = Number(annualProvision)
    this.signedBlocksWindow = Number(signedBlocksWindow)
    this.validators = validators

    this.resolveReady()
  }
}

module.exports = BlockStore
