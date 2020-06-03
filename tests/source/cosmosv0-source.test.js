const CosmosV0API = require('../../lib/source/cosmosV0-source')
const networks = require('../../data/networks')

jest.useFakeTimers()

describe('Cosmos V0 API', function () {
  describe('checkAddress()', function () {
    let api, cosmosNetworkConfig

    beforeEach(() => {
      cosmosNetworkConfig = networks.find(
        (network) => network.id === 'cosmos-hub-testnet'
      )
      api = new CosmosV0API(cosmosNetworkConfig, {})
    })

    it('When a valid prefix is passed, it should not throw an error', () => {
      expect(() =>
        api.checkAddress(`${cosmosNetworkConfig.bech32_prefix}12345ABCDE`)
      ).not.toThrow()
    })

    it('When an invalid prefix is passed, it should throw an error', () => {
      expect(() => api.checkAddress('12345ABCDE')).toThrow()
    })
  })
})
