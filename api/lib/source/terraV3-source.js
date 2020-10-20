const CosmosV2API = require('./cosmosV2-source')
const BigNumber = require('bignumber.js')
const { keyBy } = require('lodash')
const { pubkeyToAddress } = require('../tools')

class TerraV3API extends CosmosV2API {
  setReducers() {
    this.reducers = require('../reducers/terraV3-reducers')
  }

  async getValidators(height) {
    let [
      validators,
      validatorSet,
      signedBlocksWindow,
      expectedReturns
    ] = await Promise.all([
      Promise.all([
        this.query(`staking/validators?status=unbonding`),
        this.query(`staking/validators?status=bonded`),
        this.query(`staking/validators?status=unbonded`)
      ]).then((validatorGroups) => [].concat(...validatorGroups)),
      this.getValidatorsets(height),
      this.getSignedBlockWindow(),
      this.query(`https://fcd.terra.dev/v1/staking`, undefined, 'validators')
    ])

    // create a dictionary to reduce array lookups
    const consensusValidators = keyBy(validatorSet.validators, 'address')
    const totalVotingPower = validatorSet.validators.reduce(
      (sum, { voting_power }) => sum.plus(voting_power),
      BigNumber(0)
    )

    // query for signing info
    const signingInfos = keyBy(
      await this.getValidatorSigningInfos(validators),
      'address'
    )

    const expectedReturnsMap = keyBy(expectedReturns, 'operatorAddress')

    validators.forEach((validator) => {
      const consensusAddress = pubkeyToAddress(
        validator.consensus_pubkey,
        this.validatorConsensusBech32Prefix
      )
      validator.voting_power = consensusValidators[consensusAddress]
        ? BigNumber(consensusValidators[consensusAddress].voting_power)
            .div(totalVotingPower)
            .toNumber()
        : 0
      validator.signing_info = signingInfos[consensusAddress]
    })

    return validators.map((validator) => {
      const lunieValidator = this.reducers.validatorReducer(
        this.networkId,
        signedBlocksWindow,
        validator
      )

      lunieValidator.expectedReturns = expectedReturnsMap[
        lunieValidator.operatorAddress
      ]
        ? expectedReturnsMap[lunieValidator.operatorAddress].stakingReturn
        : 0

      return lunieValidator
    })
  }

  async getExpectedReturns(validator) {
    return Number(validator.expectedReturns).toFixed(6)
  }
}

module.exports = TerraV3API
