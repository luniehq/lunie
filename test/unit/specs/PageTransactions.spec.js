import Vuex from 'vuex'
import { mount, createLocalVue } from 'vue-test-utils'
import PageTransactions from 'renderer/components/wallet/PageTransactions'

const wallet = require('renderer/vuex/modules/wallet').default({})
const filters = require('renderer/vuex/modules/filters').default({})

const localVue = createLocalVue()
localVue.use(Vuex)

describe('PageTransactions', () => {
  let wrapper, store

  beforeEach(() => {
    store = new Vuex.Store({
      getters: {
        wallet: () => wallet.state,
        transactions: () => wallet.state.history,
        filters: () => filters.state
      },
      modules: {
        wallet,
        filters
      }
    })

    store.commit('setWalletHistory', [{
      tx: {
        hash: 'x',
        inputs: [
          {
            coins: [{
              denom: 'jbcoins',
              amount: 1234
            }],
            sender: 'myAddress'
          }
        ],
        outputs: [
          {
            coins: [{
              denom: 'jbcoins',
              amount: 1234
            }],
            recipient: 'otherAddress'
          }
        ]
      },
      time: Date.now()
    }, {
      tx: {
        hash: 'y',
        inputs: [
          {
            coins: [{
              denom: 'fabocoins',
              amount: 1234
            }],
            sender: 'otherAddress'
          }
        ],
        outputs: [
          {
            coins: [{
              denom: 'fabocoins',
              amount: 1234
            }],
            recipient: 'myAddress'
          }
        ]
      },
      time: Date.now() + 10
    }])

    wrapper = mount(PageTransactions, {
      localVue,
      store,
      stubs: {
        'data-empty-tx': '<data-empty-tx />'
      }
    })

    jest.spyOn(store, 'commit')
  })

  it('has the expected html structure', () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it('should show the search on click', () => {
    wrapper.find('.ni-tool-bar i').trigger('click')
    expect(wrapper.contains('.ni-modal-search')).toBe(true)
  })

  it('should sort the transaction by time', () => {
    expect(wrapper.vm.filteredTransactions.map(x => x.tx.hash)).toEqual(['y', 'x'])
  })

  it('should filter the transactions', () => {
    store.commit('setSearchVisible', ['transactions', true])
    store.commit('setSearchQuery', ['transactions', 'fabo'])
    expect(wrapper.vm.filteredTransactions.map(x => x.tx.hash)).toEqual(['y'])
    // reflects the filter in the view
    expect(wrapper.vm.$el).toMatchSnapshot()
    store.commit('setSearchQuery', ['transactions', 'jb'])
    expect(wrapper.vm.filteredTransactions.map(x => x.tx.hash)).toEqual(['x'])
  })

  it('should show an error if there are no transactions', () => {
    store.commit('setWalletHistory', [])
    wrapper.update()
    expect(wrapper.contains('data-empty-tx')).toBe(true)
  })
})
