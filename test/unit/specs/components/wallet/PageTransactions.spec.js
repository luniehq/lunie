import PageTransactions from "renderer/components/wallet/PageTransactions"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"
import { createLocalVue, shallowMount } from "@vue/test-utils"

describe(`PageTransactions`, () => {
  const localVue = createLocalVue()
  localVue.directive(`tooltip`, () => { })
  const { stakingParameters, txs, candidates } = lcdClientMock.state
  let wrapper, $store
  const stubs = {
    "tm-li-any-transaction": true,
    "data-empty-tx": true,
    "data-empty-search": true,
    "tm-data-error": true,
  }
  const allTransactions = txs.slice(0, 6)

  const getters = {
    filters: {
      transactions: {
        search: {
          query: ``,
          visible: false
        }
      }
    },
    bondDenom: stakingParameters.parameters.bond_denom,
    wallet: {
      address: `B`
    },
    transactions: {
      loading: false,
      loaded: true,
      error: undefined
    },
    delegation: {
      unbondingDelegations: {} // TODO: add some
    },
    delegates: {
      delegates: candidates
    },
    allTransactions,
    connected: true
  }

  beforeEach(() => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters
    }

    wrapper = shallowMount(PageTransactions, {
      localVue,
      mocks: {
        $store
      },
      stubs
    })
  })

  describe(`has the expected html structure`, () => {
    it(`if user has signed in`, async () => {
      expect(wrapper.vm.$el).toMatchSnapshot()
    })

    it(`if user hasn't signed in`, async () => {
      delete getters.wallet.address
      $store = {
        commit: jest.fn(),
        dispatch: jest.fn(),
        getters
      }

      wrapper = shallowMount(PageTransactions, {
        localVue,
        mocks: {
          $store
        },
        stubs
      })
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  })

  it(`should refresh the transaction history`, async () => {
    await PageTransactions.methods.refreshTransactions.call({ $store })
    expect($store.dispatch).toHaveBeenCalledWith(`getAllTxs`)
  })

  it(`should show transactions`, async () => {
    expect(wrapper.findAll(`tm-li-any-transaction-stub`).length).toBe(6)
  })

  it(`should sort the transaction by time`, () => {
    expect(wrapper.vm.filteredTransactions.map(x => x.height)).toEqual([
      56673,
      213,
      170,
      160,
      150,
      1
    ])
  })

  it(`should filter the transactions`, () => {
    const faboTransactions = PageTransactions.computed.filteredTransactions.call(
      {
        filters: { transactions: { search: { query: `fabo`, visible: true } } },
        orderedTransactions: allTransactions
      }
    )
    expect(faboTransactions.map(e => e.height)).toEqual([150])
  })
})
