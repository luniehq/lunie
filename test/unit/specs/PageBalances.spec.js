import Vuex from 'vuex'
import { mount, createLocalVue } from 'vue-test-utils'
import PageBalances from 'renderer/components/wallet/PageBalances'

const filters = require('renderer/vuex/modules/filters').default({})
const wallet = require('renderer/vuex/modules/wallet').default({})

const localVue = createLocalVue()
localVue.use(Vuex)

describe('PageBalances', () => {
  let wrapper, store

  beforeEach(() => {
    store = new Vuex.Store({
      getters: {
        filters: () => filters.state,
        wallet: () => wallet.state
      },
      modules: {
        filters,
        wallet
      }
    })
    wrapper = mount(PageBalances, {
      localVue,
      store,
      stub: {
        AnchorCopy: true,
        Btn: true,
        ListItem: true,
        ModalSearch: true,
        Page: true,
        Part: true,
        ToolBar: true
      }
    })
    store.commit('setWalletBalances', [{
      denom: 'ATOM',
      amount: 123
    }, {
      denom: 'FERMION',
      amount: 456
    }])
    store.commit('setSearchQuery', ['balances', ''])
    store.state.wallet.key.address = '123abc456def'

    jest.spyOn(store, 'commit')
    jest.spyOn(store, 'dispatch')
  })

  it('has the expected html structure', () => {
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should sort the balances by denom', () => {
    expect(wrapper.vm.filteredBalances.map(x => x.denom)).toEqual(['FERMION', 'ATOM'])
  })

  it('should filter the balances', () => {
    store.commit('setSearchVisible', ['balances', true])
    store.commit('setSearchQuery', ['balances', 'atom'])
    expect(wrapper.vm.filteredBalances.map(x => x.denom)).toEqual(['ATOM'])
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should update balances by querying wallet state', () => {
    wrapper.vm.updateBalances()
    expect(store.dispatch).toHaveBeenCalledWith('queryWalletState')
  })

  it('should show the search on click', () => {
    wrapper.find('.ni-tool-bar i').trigger('click')
    expect(wrapper.contains('.ni-modal-search')).toBe(true)
  })

  it('should list the denoms that are available', () => {
    expect(wrapper.findAll('.ni-li').length).toBe(2) // 2 denoms
  })

  it('should show the n/a message if there are no denoms', () => {
    store.commit('setWalletBalances', [])
    wrapper.update()
    expect(wrapper.findAll('.ni-li').length).toBe(1) // 1 n/a / 0 denoms
    expect(wrapper.findAll('.ni-li').at(0).html()).toContain('N/A') // 1 address + 1 n/a
  })

  it('should not show the n/a message if there denoms', () => {
    wrapper.update()
    expect(wrapper.findAll('.ni-li').length).toBe(2) // 2 denoms
    expect(wrapper.findAll('.ni-li').at(0).html()).not.toContain('N/A')
    expect(wrapper.findAll('.ni-li').at(1).html()).not.toContain('N/A')
  })
  // TODO do we test mousetrap stuff??
})
