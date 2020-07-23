const database = require('./database')
const config = require('../config')

let addressesDictionary = {}

const clearAddressesDictionary = () => {
  // clear old records, that are older than 1 hour
  Object.keys(addressesDictionary).map((key) =>
    process.hrtime(addressesDictionary[key])[0] > 60 * 60
      ? delete addressesDictionary[key]
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
      action: transaction.type || transaction.messageType,
      hash: transaction.hash, // we are not getting this in Substrate networks for reasons explained below
      added: Date.now(),
      fingerprint
    }
    // since we are not polling to get the transaction from the blockchain itself for Polkadot, we are not running
    // either the transactionReducer on it, so we need this hack for now
    const message = transaction.details || transaction.message
    if (!message.amounts && !message.amount) {
      store(baseRow)
      return
    }
    const amounts = message.amounts || [message.amount]
    amounts.forEach(({ amount, denom }) => {
      store({
        ...baseRow,
        value: Number(amount),
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

const logBalances = async (
  networks,
  balance,
  address,
  networkId,
  fingerprint
) => {
  let key = address + networkId // just a key to store data about last request time
  const network = networks.find(({ id }) => id === networkId)
  /*
   we are requesting balances toooooo frequently 
   and we don't need so many records in db
   so limiting writting posibilities to 1 hour
  */
  if (addressesDictionary[key]) {
    if (process.hrtime(addressesDictionary[key])[0] < 60 * 60) {
      return clearAddressesDictionary()
    }
  }
  addressesDictionary[key] = process.hrtime() // time in ms
  // common object
  let data = {
    address,
    network: networkId,
    fingerprint,
    action: ``,
    added: Date.now(),
    value: 0,
    denom: network.stakingDenom
  }
  // store liquidStake
  data.action = 'liquidStake'
  data.value = balance.available.toString()
  store(data)
  // store totalStake
  data.action = 'totalStake'
  data.value = balance.total.toString()
  store(data)
}

const logRewards = async (
  networks,
  rewards,
  address,
  networkId,
  fingerprint
) => {
  let key = address + networkId // just a key to store data about last request time
  const network = networks.find(({ id }) => id === networkId)
  // also limiting here rewards records to 1h
  if (addressesDictionary[key]) {
    if (process.hrtime(addressesDictionary[key])[0] < 60 * 60) {
      return clearAddressesDictionary()
    }
  }
  addressesDictionary[key] = process.hrtime() // time in ms

  let data = {
    address,
    network: networkId,
    fingerprint,
    action: `rewards`,
    added: Date.now(),
    value: 0
  }
  // store rewards
  // summing rewards with one denom
  if (rewards) {
    rewards
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
        data.value = reward.amount
        data.denom = reward.denom
        store(data)
      })
  }
}

module.exports = {
  storeTransactions,
  logBalances,
  logRewards
}
