const database = require('../lib/database')
const config = require('../config')
const db = database(config)('polkadot_testnet')
const { ApiPromise, WsProvider } = require('@polkadot/api')
const _ = require('lodash')

async function initPolkadotRPC(network, store) {
  console.time('init polkadot')
  const api = new ApiPromise({
    provider: new WsProvider(network.rpc_url)
  })
  store.polkadotRPC = api
  await api.isReady
  console.timeEnd('init polkadot')
}

function storeRewards(rewards, chainId) {
  return db.upsert('rewards', rewards, undefined, chainId) // height is in the rewards rows already
}

async function main() {
  const networks = require('../data/networks')
  const network = networks.find(({ id }) => id === 'polkadot-testnet')
  const PolkadotApiClass = require('../lib/' + network.source_class_name)
  const store = {}
  await initPolkadotRPC(network, store)
  const polkadotAPI = new PolkadotApiClass(network, store)

  const validators = await polkadotAPI.getAllValidators()
  store.validators = _.keyBy(validators, 'operatorAddress')
  const delegators = await polkadotAPI.getAllDelegators()

  await Promise.all(
    delegators.map(async delegator => {
      const rewards = await polkadotAPI.getRemoteRewards(delegator)
      const storableRewards = rewards
        ? rewards.filter(({ amount }) => amount > 0)
        : []
      if (storableRewards.length > 0) {
        await storeRewards(
          rewards.map(reward => ({
            amount: reward.amount,
            height: reward.height,
            denom: reward.denom,
            address: reward.address,
            validator: reward.validatorAddress
          })),
          validators[0].chainId
        )
      }
    })
  )
}

main()
