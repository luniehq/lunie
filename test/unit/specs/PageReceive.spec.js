import Vuex from 'vuex'
import { mount, createLocalVue } from 'vue-test-utils'
import PageReceive from '@/renderer/components/wallet/PageReceive'

const allAddresses = require('@/renderer/vuex/modules/allAddresses').default({})
const allWallets = require('@/renderer/vuex/modules/allWallets').default({})

const localVue = createLocalVue()
localVue.use(Vuex)

describe('PageReceive', () => {
  let wrapper, store

  beforeEach(() => {
    store = new Vuex.Store({
      getters: {
        allAddresses: () => allAddresses.state,
        allWallets: () => allWallets.state
      },
      modules: {
        allAddresses,
        allWallets
      }
    })
    wrapper = mount(PageReceive, {
      localVue,
      store,
      stub: {
        CardAddress: true,
        Field: true,
        Btn: true,
        CardNew: true,
        Page: true
      }
    })
    // store.commit('setWalletBalances', [{
    //   denom: '123',
    //   amount: 123
    // }, {
    //   denom: '456',
    //   amount: 456
    // }])
  })

  it('has the expected html structure', () => {
    expect(wrapper.html()).toMatchSnapshot()
  })

  // it('should sort the balances by denom', () => {
  //   expect(wrapper.vm.filteredBalances.map(x => x.denom)).toEqual(['456', '123'])
  // })
  //
  // it('should filter the balances', () => {
  //   store.commit('setSearchVisible', ['balances', true])
  //   store.commit('setSearchQuery', ['balances', '12'])
  //   expect(wrapper.vm.filteredBalances.map(x => x.denom)).toEqual(['123'])
  //   expect(wrapper.html()).toMatchSnapshot()
  // })
  //
  // it('should show the search on click', () => {
  //   wrapper.find('.ni-tool-bar i').trigger('click')
  //   expect(wrapper.contains('.ni-modal-search')).toBe(true)
  // })

  // TODO do we test moustrap stuff??
})
