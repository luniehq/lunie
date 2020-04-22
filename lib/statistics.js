const database = require('./database')
const config = require('../config')

let overviewedAddresses = {}
let prestoredTransactions = {}

const clearOverviewedAddresses = () => {
  // clear old records, that are older than 1 hour
  Object.keys(overviewedAddresses).map(key =>
    process.hrtime(overviewedAddresses[key])[0] > 60 * 60
      ? delete overviewedAddresses[key]
      : null
  )
}
const clearPrestoredTransactions = () => {
  // clear old records, that are older than 10 minute
  Object.keys(prestoredTransactions).filter(hash =>
    process.hrtime(prestoredTransactions[hash].time)[0] > 10 * 60
      ? delete prestoredTransactions[hash]
      : null
  )
}

const storePrestored = hash => {
  let transaction = prestoredTransactions[hash]
  if (transaction) {
    new database(config)('').storeStatistics(transaction.payload)
    delete prestoredTransactions[hash]
  }
  clearPrestoredTransactions()
}

const filterPayload = payload => {
  payload = Object.assign({}, payload) // copying object
  // sending it to the db
  let possibleKeys = [
    'network',
    'address',
    'action',
    'value',
    'fingerprint',
    'denom'
  ] // possible keys
  Object.keys(payload).map(key => {
    if (possibleKeys.indexOf(key) === -1) {
      delete payload[key]
    }
  })
  return payload
}

const store = async payload => {
  payload = filterPayload(payload)
  return new database(config)('').storeStatistics(payload)
}

const prestore = async (payload, hash) => {
  payload = filterPayload(payload)
  prestoredTransactions[hash] = {
    payload,
    time: process.hrtime()
  }
}
const defineActionValue = msg => {
  if (msg.length == 1 && msg[0].value.amount) {
    return Array.isArray(msg[0].value.amount)
      ? msg[0].value.amount[0].amount
      : msg[0].value.amount.amount
  }
  return 0
}
const defineActionDenom = msg => {
  if (msg.length == 1 && msg[0].value.amount) {
    return Array.isArray(msg[0].value.amount)
      ? msg[0].value.amount[0].denom
      : msg[0].value.amount.denom
  }
  return ''
}
const defineActionType = type => {
  if (type.indexOf('/MsgDelegate') !== -1) {
    return 'Delegate'
  } else if (type.indexOf('/MsgUndelegate') !== -1) {
    return 'Undelegate'
  } else if (type.indexOf('/MsgSend') !== -1) {
    return 'Send'
  } else if (type.indexOf('/MsgWithdrawDelegationReward') !== -1) {
    return 'Withdraw'
  } else if (type.indexOf('/MsgDeposit') !== -1) {
    return 'Deposit'
  } else if (type.indexOf('/MsgBeginRedelegate') !== -1) {
    return 'Redelegate'
  }
  return type
}
const logOverview = (overview, fingerprint) => {
  let key = overview.address + overview.networkId // just a key to store data about last request time
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
    address: overview.address,
    network: overview.networkId,
    fingerprint,
    action: ``,
    value: ``
  }
  // store liquidStake
  data.action = 'liquidStake'
  data.value = overview.liquidStake.toString()
  store(data)
  // store totalStake
  data.action = 'totalStake'
  data.value = overview.totalStake.toString()
  store(data)
  // store totalRewards
  if (overview.totalRewards) {
    data.action = 'totalRewards'
    data.value = overview.totalRewards.toString()
    store(data)
  }
  // store rewards
  // summing rewards with one denom
  if (overview.rewards) {
    overview.rewards
      .reduce((newArray, currentItem) => {
        const index = newArray.findIndex(el => el.denom == currentItem.denom)
        if (index !== -1) {
          newArray[index].amount *= 1
          newArray[index].amount += currentItem.amount * 1
        } else {
          newArray.push(currentItem)
        }
        return newArray
      }, [])
      .map(reward => {
        data.action = 'rewards'
        data.denom = reward.denom
        data.value = reward.amount
        store(data)
      })
  }
}
module.exports = {
  prestore,
  storePrestored,
  defineActionType,
  logOverview,
  defineActionDenom,
  defineActionValue
}
