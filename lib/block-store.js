class BlockStore {
  constructor(networkId) {
    this.networkId = networkId
    this.latestHeight = 0
    this.block = {}
    this.stakingDenom = ''
    this.annualProvision = 0
    this.signedBlocksWindow = 0
    this.validators = {}
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
  }
}

module.exports = BlockStore
