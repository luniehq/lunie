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

  const dDisplay = d
  // const hDisplay = h + 'h '
  // const mDisplay = m + 'm'

  // return dDisplay + hDisplay + mDisplay
  return dDisplay
}

const getDateFromDayNum = function (dayNum) {
  const date = new Date()
  date.setMonth(0)
  date.setDate(0)
  const timeOfFirst = date.getTime() // this is the time in milliseconds of 1/1/YYYY
  const dayMilli = 1000 * 60 * 60 * 24
  const dayNumMilli = dayNum * dayMilli
  date.setTime(timeOfFirst + dayNumMilli)
  return date
}

const blockToDate = (block, network) => {
  const blocktime = (network.blockTime || 6000) / 1000 // 6000ms is the block time for both Polkadot and Kusama
  if (typeof block !== 'number') {
    block = block.toNumber()
  }
  const dayNumberInYear = secondsToDhm(block * blocktime)
  const date = getDateFromDayNum(dayNumberInYear - 23) // there is a 23 days offset, no idea why
  return date.toUTCString()
}

module.exports = {
  constructProposal,
  blockToDate
}
