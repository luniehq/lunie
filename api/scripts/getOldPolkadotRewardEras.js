const database = require('../lib/database')
const config = require('../config')
const { ApiPromise, WsProvider } = require('@polkadot/api')
const _ = require('lodash')
const BN = require('bignumber.js')
const fs = require('fs')
const path = require('path')
const { isHex } = require("@polkadot/util")
const Sentry = require('@sentry/node')

if (config.SENTRY_DSN) {
  const Sentry = require('@sentry/node')
  Sentry.init({
    dsn: config.SENTRY_DSN,
    release: require('../package.json').version
  })
}

const currentEraArg = require('minimist')(process.argv.slice(2))
let currentEra = currentEraArg['currentEra']
const networkId = currentEraArg['network']
const schema = networkId.replace("-", "_")
const db = database(config)(schema)

const eraCachePath = networkId => path.join(
  __dirname,
  '..',
  'caches',
  `${networkId}-eras.json`
)

async function initPolkadotRPC(network, store) {
  const api = new ApiPromise({
    provider: new WsProvider(network.rpc_url || network.public_rpc_url)
  })
  store.polkadotRPC = api
  await api.isReady
}

function cleanOldRewards(minDesiredEra) {
  if (minDesiredEra >= 0) {
    return db.query(`
      mutation {
        delete_${schema}_rewards(where:{height: {_lt: "${minDesiredEra}"}}) {
          affected_rows
        }
      }
    `)
  }
  return
}

function storeRewards(rewards, chainId) {
  return db.upsert('rewards', rewards, undefined, chainId) // height is in the rewards rows already
}

function storeEraData(networkId, [erasPoints, erasPreferences, erasRewards, exposures]) {
  if (fs.existsSync(eraCachePath(networkId))) fs.unlinkSync(eraCachePath(networkId))
  fs.writeFileSync(
    eraCachePath(networkId),
    JSON.stringify([erasPoints, erasPreferences, erasRewards, exposures])
  )
}

function loadStoredEraData(networkId) {
  if (
    !fs.existsSync(eraCachePath(networkId)) ||
    fs.readFileSync(eraCachePath(networkId), 'utf8') === ''
  )
    return {
      storedEraPoints: [],
      storedEraPreferences: [],
      storedEraRewards: [],
      storedExposures: [],
      lastStoredEra: 0
    }
  const [
    storedEraPoints,
    storedEraPreferences,
    storedEraRewards,
    storedExposures
  ] = JSON.parse(fs.readFileSync(eraCachePath(networkId), 'utf8'))

  return {
    storedEraPoints,
    storedEraPreferences,
    storedEraRewards,
    storedExposures,
    lastStoredEra: _.max(_.keys(storedEraPoints))
  }
}

const ZERO = BN(0)
const COMM_DIV = BN(1000000000)
function parseRewards(
  delegator,
  [erasPoints, erasPreferences, erasRewards, exposures]
) {
  return exposures
    .map(({ era, isEmpty, validators: eraValidators }) => {
      const { eraPoints, validators: allValidatorPoints } = erasPoints[era] || {
        eraPoints: ZERO,
        validators: {}
      }
      const { eraReward } = erasRewards[era] || {
        eraReward: 0
      }
      const { validators: allValidatorPreferences } = erasPreferences[era] || {
        validators: {}
      }
      const validators = {}

      Object.entries(eraValidators).forEach(([validatorId, exposure]) => {
        const validatorPoints = allValidatorPoints[validatorId]
          ? BN(allValidatorPoints[validatorId])
          : ZERO
        const validatorCommission = allValidatorPreferences[validatorId]
          ? BN(allValidatorPreferences[validatorId].commission)
          : ZERO
        const available = BN(eraReward)
          .times(validatorPoints)
          .dividedBy(eraPoints)
        const validatorCut = validatorCommission
          .times(available)
          .dividedBy(COMM_DIV)
        const exposureTotal = BN(exposure.total)
        let value = BN(0)

        if (!exposureTotal.isZero() && !validatorPoints.isZero()) {
          let staked
          if (validatorId === delegator) {
            staked = exposure.own
          } else {
            const stakerExposure = exposure.others.find(
              ({ who }) => who.toString() === delegator
            )
            staked = stakerExposure ? stakerExposure.value : ZERO
            staked = isHex(staked) ? new BN(staked.substr(2, staked.length - 2), 16) : new BN(staked)
          }
          value = available
            .minus(validatorCut)
            .times(staked)
            .dividedBy(exposureTotal)
            .plus(validatorId === delegator ? validatorCut : ZERO)
        }
        validators[validatorId] = value
      })

      return {
        era,
        isEmpty,
        validators,
        address: delegator
      }
    })
    .filter(({ isEmpty }) => !isEmpty)
}

function getDelegatorExposure(exposures, delegator) {
  return exposures.map(
    ({ era, nominators: allNominators, validators: allValidators }) => {
      const isValidator = !!allValidators[delegator]
      const validators = {}
      const nominating = allNominators[delegator] || []

      if (isValidator) {
        validators[delegator] = allValidators[delegator]
      } else if (nominating) {
        nominating.forEach(({ validatorId }) => {
          validators[validatorId] = allValidators[validatorId]
        })
      }

      return {
        era,
        isEmpty: !Object.keys(validators).length,
        isValidator,
        nominating,
        validators
      }
    }
  )
}

function getRewardsForDelegator(
  delegator,
  eraPoints,
  eraPreferences,
  eraRewards,
  exposures
) {
  const exposure = getDelegatorExposure(exposures, delegator)
  const rewards = parseRewards(delegator, [
    eraPoints,
    eraPreferences,
    eraRewards,
    exposure
  ])

  return rewards
}

async function loadEraData(missingEras, api) {
  let [eraPoints, eraPreferences, eraRewards] = await Promise.all([
    api.derive.staking
      .erasPoints(missingEras)
      .then(result => _.keyBy(result, 'era')),
    api.derive.staking
      .erasPrefs(missingEras)
      .then(result => _.keyBy(result, 'era')),
    api.derive.staking
      .erasRewards(missingEras)
      .then(result => _.keyBy(result, 'era'))
  ])
  // load one exposure after another as this is very costly and might time out the API
  let exposures = []
  for (let i = 0; i < missingEras.length; i++) {
    console.time('loading exposure for era ' + missingEras[i])
    const result = await api.derive.staking._erasExposure([missingEras[i]])
    console.timeEnd('loading exposure for era ' + missingEras[i])
    exposures = exposures.concat(result)
  }

  return [eraPoints, eraPreferences, eraRewards, exposures]
}

function cropEraData(
  minDesiredEra,
  [storedEraPoints, storedEraPreferences, storedEraRewards, storedExposures],
  [eraPoints, eraPrefs, eraRewards, exposures]
) {
  const newEraData = [
    _.fromPairs(
      _.toPairs(storedEraPoints)
        .filter(([era]) => era >= minDesiredEra)
        .concat(_.toPairs(eraPoints))
    ),
    _.fromPairs(
      _.toPairs(storedEraPreferences)
        .filter(([era]) => era >= minDesiredEra)
        .concat(_.toPairs(eraPrefs))
    ),
    _.fromPairs(
      _.toPairs(storedEraRewards)
        .filter(([era]) => era >= minDesiredEra)
        .concat(_.toPairs(eraRewards))
    ),
    storedExposures.filter(({ era }) => era >= minDesiredEra).concat(exposures)
  ]

  return newEraData
}

async function getMissingEras(lastStoredEra, currentEra) {
  const CLAIMABLE_REWARD_SPAN = 84
  const desiredEras = Array.from(new Array(CLAIMABLE_REWARD_SPAN).keys())
    .map((index) => index + 1 + currentEra - CLAIMABLE_REWARD_SPAN)
    .filter(era => era > 0)

  const minDesiredEra = _.min(desiredEras)
  const maxDesiredEra = _.max(desiredEras)
  const missingEras = desiredEras.filter(era => era > lastStoredEra)

  return { minDesiredEra, missingEras, maxDesiredEra }
}

async function main() {
  try {

    // get previously stored data
    let {
      storedEraPoints,
      storedEraPreferences,
      storedEraRewards,
      storedExposures,
      lastStoredEra
    } = loadStoredEraData(networkId)
  
    if (currentEra && currentEra <= lastStoredEra) {
      console.log('Rewards for this era are already stored')
      process.exit(0)
    }
  
    console.log("Getting rewards from era:", currentEra || 'latest')
  
    const networks = await database(config)("").getNetworks()
    const network = networks.find(({ id }) => id === networkId)
    const PolkadotApiClass = require('../lib/' + network.source_class_name)
    const FiatValuesAPI = require('../lib/fiatvalues-api')
    const store = {}
    await initPolkadotRPC(network, store)
    let api = store.polkadotRPC
    
    const polkadotAPI = new PolkadotApiClass(network, store, new FiatValuesAPI())
  
    if (!currentEra) {
      const activeEra = parseInt(
        JSON.parse(JSON.stringify(await api.query.staking.activeEra())).index
      )
      const lastEra = activeEra - 1
      currentEra = lastEra
    }
  
    const validators = await polkadotAPI.getValidators()
    store.validators = _.keyBy(validators, 'operatorAddress')
    const delegators = await polkadotAPI.getAllDelegators()
    console.log(`Querying rewards for ${delegators.length} delegators.`)
  
    const { minDesiredEra, missingEras, maxDesiredEra } = await getMissingEras(
      lastStoredEra,
      currentEra
    )
    console.log({ minDesiredEra, missingEras, maxDesiredEra })
  
    const [eraPoints, eraPreferences, eraRewards, exposures] = await loadEraData(
      missingEras,
      api
    )
  
    // disconnect from the API WS
    api.disconnect()
  
    // filter out not needed data and stitch old and new data together
    const newEraData = cropEraData(
      minDesiredEra,
      [storedEraPoints, storedEraPreferences, storedEraRewards, storedExposures],
      [eraPoints, eraPreferences, eraRewards, exposures]
    )
  
    // store data to only load missing data the next run
    storeEraData(networkId, newEraData)
  
    // calculate the actual rewards from the inputs
    console.time('calculating rewards')
    const polkadotRewards = [].concat(
      ...delegators.map(delegator =>
        getRewardsForDelegator(delegator, ...newEraData)
      )
    )
  
    console.timeEnd('calculating rewards')
  
    // parse to lunie format
    console.time('parsing lunie rewards')
    const lunieRewards = polkadotAPI.reducers.rewardsReducer(
      network,
      validators,
      polkadotRewards,
      polkadotAPI.reducers
    )
    console.timeEnd('parsing lunie rewards')
  
    // store
    const storableRewards = _.uniqBy(lunieRewards
      ? lunieRewards.filter(({ amount }) => amount > 0)
      : [], reward => `${reward.address}_${reward.validatorAddress}_${reward.height}_${reward.chain_id}`) // HACK somehow we get some rewards twice which causes the insert to fail 
  
    if (storableRewards.length === 0) {
      const error = `No storable rewards for era ${maxDesiredEra}`
      console.error(`Error: ${error}`)
      Sentry.captureException({ error })
    } else {
      console.log(
        `Storing ${storableRewards.length} rewards for era ${maxDesiredEra}.`
      )
      const rewardChunks = _.chunk(storableRewards, 1000)
      for (let i = 0; i < rewardChunks.length; i++) {
        const res = await storeRewards(
          rewardChunks[i].map(reward => ({
            amount: reward.amount,
            height: reward.height,
            denom: reward.denom,
            address: reward.address,
            validator: reward.validatorAddress
          })),
          network.chain_id
        )
      }
    }
    console.log(
      `Cleaning old rewards for era ${maxDesiredEra}.`
    )
    await cleanOldRewards(minDesiredEra)
    console.log('Finished querying, storing and cleaning rewards')
    process.exit(0)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

main()
