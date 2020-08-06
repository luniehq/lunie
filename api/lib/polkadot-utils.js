const constructProposal = (api, bytes) => {
  let proposal

  try {
    proposal = api.registry.createType('Proposal', bytes.toU8a(true))
  } catch (error) {
    console.log(error)
  }

  return proposal
}

function secondsToDhm(seconds) {
  seconds = Number(seconds)
  const d = Math.floor(seconds / (3600 * 24))
  const h = Math.floor((seconds % (3600 * 24)) / 3600)
  const m = seconds < 60 ? 1 : Math.floor((seconds % 3600) / 60)

  const dDisplay = d + 'd '
  const hDisplay = h + 'h '
  const mDisplay = m + 'm'

  return dDisplay + hDisplay + mDisplay
}

const blockToDate = (block, network) => {
  const blocktime = (network.blockTime || 6000) / 1000 // 6000ms is the block time for both Polkadot and Kusama

  if (typeof block !== 'number') {
    block = block.toNumber()
  }

  const time = secondsToDhm(block * blocktime)

  return time
}

module.exports = {
  constructProposal,
  blockToDate
}
