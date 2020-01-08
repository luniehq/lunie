class BlockStore {
  constructor(network, readyCallback) {
    this.network = network
    this.latestHeight = 0
    this.block = {}
    this.stakingDenom = ''
    this.annualProvision = 0
    this.signedBlocksWindow = 0
    this.validators = {}
    this.ready = false
    this.readyCallback = readyCallback
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

    if (!this.ready && this.readyCallback && this.latestHeight !== 0) {
      this.readyCallback(this.latestHeight !== 0)
      this.ready = true
    }
  }
}

module.exports = BlockStore
