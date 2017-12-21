import setup from '../helpers/vuex-setup'
import PageTransactions from 'renderer/components/wallet/PageTransactions'

describe('PageTransactions', () => {
  let wrapper, store

  beforeEach(() => {
    let test = setup()
    let instance = test.mount(PageTransactions, {
      'li-transaction': '<li-transaction />',
      'data-empty-tx': '<data-empty-tx />'
    })
    wrapper = instance.wrapper
    store = instance.store

    store.commit('setWalletKey', {address: 'myAddress'})
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

    wrapper.update()
  })

  it('has the expected html structure', () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it('should show the search on click', () => {
    wrapper.find('.ni-tool-bar i').trigger('click')
    expect(wrapper.contains('.ni-modal-search')).toBe(true)
  })

  it('should show transactions', () => {
    expect(wrapper.findAll('li-transaction').length).toBe(2)
  })

  it('should sort the transaction by time', () => {
    expect(wrapper.vm.filteredTransactions.map(x => x.tx.hash)).toEqual(['y', 'x'])
  })

  it('should filter the transactions', () => {
    store.commit('setSearchVisible', ['transactions', true])
    store.commit('setSearchQuery', ['transactions', 'fabo'])
    wrapper.update()
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
