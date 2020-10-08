const CosmosV2API = require('../../lib/source/cosmosV2-source')
const {
  delegatorAddress,
  mockValidatorsDictionary,
  delegatorRewards
} = require('./mock_data/delegators')

jest.useFakeTimers()
let mockDelegatorRewards = { ...delegatorRewards }
jest.mock('apollo-datasource-rest', () => {
  class MockRESTDataSource {
    constructor() {
      this.memoizedResults = {
        clear: jest.fn()
      }
    }

    get() {
      return mockDelegatorRewards
    }
  }

  return {
    RESTDataSource: MockRESTDataSource,
    HTTPCache: class MockHTTPCache {}
  }
})

const network = {
  getCoinLookup() {
    return {
      chainDenom: 'umuon',
      viewDenom: 'MUON',
      chainToViewConversionFactor: 0.000001
    }
  }
}

describe('Cosmos V2 API', function () {
  describe('getRewards()', function () {
    let api, cosmosNetworkConfig, store

    beforeEach(() => {
      cosmosNetworkConfig = {
        bech32_prefix: 'cosmos', // DEPRECATE
        address_prefix: 'cosmos',
        getCoinLookup() {
          return {
            viewDenom: 'ATOM'
          }
        }
      }
      store = {
        validators: mockValidatorsDictionary
      }
      api = new CosmosV2API(cosmosNetworkConfig, store)
      mockDelegatorRewards = JSON.parse(JSON.stringify(delegatorRewards))
    })

    it('When an existing delegator address is passed, it should return the calculated rewards', async () => {
      //Act
      const result = await api.getRewards(delegatorAddress, 'EUR', network)

      //Assert
      expect(result[0]).toHaveProperty('amount')
      expect(result[0]).toHaveProperty('denom')
      expect(result[0].validator).toEqual(
        mockValidatorsDictionary[delegatorAddress]
      )
    })

    it('When an existing delegator address has no rewards, it should return no rewards', async () => {
      //Arrange
      mockDelegatorRewards.result.rewards = []

      //Act & Assert
      await expect(
        api.getRewards(delegatorAddress, 'EUR', network)
      ).resolves.toEqual([])
    })

    it('When an existing delegator address is passed with a reward 49000000 (umuon), it should return amount 49 (muon)', async () => {
      //Arrange
      mockDelegatorRewards.result.rewards[0].reward[0].amount = 49000000

      //Act & Assert
      await expect(
        api.getRewards(delegatorAddress, 'EUR', network)
      ).resolves.toEqual([
        {
          id: 'cosmos1fh44aqn7m4v570ujtjlmt3dytq80qyfwj07ckc_MUON_EUR',
          amount: '49',
          denom: 'MUON',
          fiatValue: undefined,
          validator: mockValidatorsDictionary[delegatorAddress]
        }
      ])
    })

    it('When an existing delegator address is passed with a reward < 1 (umuon), it should get filtered out', async () => {
      //Arrange
      mockDelegatorRewards.result.rewards[0].reward[0].amount = 0.05

      //Act & Assert
      await expect(
        api.getRewards(delegatorAddress, 'EUR', network)
      ).resolves.toEqual([])
    })
  })
})
