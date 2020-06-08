const database = require('./database')
const config = require('../config')
const networks = require('../data/networks')

let overviewedAddresses = {}

const clearOverviewedAddresses = () => {
  // clear old records, that are older than 1 hour
  Object.keys(overviewedAddresses).map((key) =>
    process.hrtime(overviewedAddresses[key])[0] > 60 * 60
      ? delete overviewedAddresses[key]
      : null
  )
}

const storeTransactions = (
  transactions,
  networkId,
  senderAddress,
  fingerprint
) => {
  transactions.forEach((transaction) => {
    const baseRow = {
      network: networkId,
      address: senderAddress,
      action: transaction.type,
      hash: transaction.hash,
      fingerprint
    }
    if (!transaction.details.amounts && !transaction.details.amount) {
      store(baseRow)
      return
    }
    const amounts = transaction.details.amounts || [transaction.details.amount]
    amounts.forEach(({ amount, denom }) => {
      store({
        ...baseRow,
        value: amount,
        denom
      })
    })
  })
}

const filterPayload = (payload) => {
  payload = Object.assign({}, payload) // copying object
  // sending it to the db
  let possibleKeys = [
    'network',
    'address',
    'action',
    'value',
    'fingerprint',
    'denom',
    'hash'
  ] // possible keys
  Object.keys(payload).map((key) => {
    if (possibleKeys.indexOf(key) === -1) {
      delete payload[key]
    }
  })
  return payload
}

const store = async (payload) => {
  payload = filterPayload(payload)
  return database(config)('').storeStatistics(payload)
}

const logOverview = async (overview, address, networkId, fingerprint) => {
  let key = address + networkId // just a key to store data about last request time
  const network = networks.find(({ id }) => id === networkId)
  /*
   we are requesting balances toooooo frequently 
   and we don't need so many records in db
   so limiting writting posibilities to 1 hour
  */
  if (overviewedAddresses[key]) {
    if (process.hrtime(overviewedAddresses[key])[0] < 60 * 60) {
      return clearOverviewedAddresses()
    }
  }
  overviewedAddresses[key] = process.hrtime() // time in ms
  // common object
  let data = {
    address,
    network: networkId,
    fingerprint,
    action: ``,
    value: 0,
    denom: network.stakingDenom
  }
  // store liquidStake
  data.action = 'liquidStake'
  data.value = overview.liquidStake.toString()
  store(data)
  // store totalStake
  data.action = 'totalStake'
  data.value = overview.totalStake.toString()
  store(data)
  // store rewards
  // summing rewards with one denom
  if (overview.rewards) {
    overview.rewards
      .reduce((newArray, currentItem) => {
        const index = newArray.findIndex((el) => el.denom == currentItem.denom)
        if (index !== -1) {
          newArray[index].amount *= 1
          newArray[index].amount += currentItem.amount * 1
        } else {
          newArray.push(currentItem)
        }
        return newArray
      }, [])
      .map((reward) => {
        data.action = 'rewards'
        data.denom = reward.denom
        data.value = reward.amount
        store(data)
      })
  }
}
module.exports = {
  storeTransactions,
  logOverview
}
