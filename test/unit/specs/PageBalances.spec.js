import Vuex from 'vuex'
import { mount, createLocalVue } from 'vue-test-utils'
import PageBalances from '../../../app/src/renderer/components/wallet/PageBalances'

const filters = require('../../../app/src/renderer/vuex/modules/filters').default({})
const wallet = require('../../../app/src/renderer/vuex/modules/wallet').default({})

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
      denom: '123',
      amount: 123
    }, {
      denom: '456',
      amount: 456
    }])
  })

  it('has the expected html structure', () => {
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should sort the balances by denom', () => {
    expect(wrapper.vm.filteredBalances.map(x => x.denom)).toEqual(['456', '123'])
  })

  it('should filter the balances', () => {
    store.commit('setSearchVisible', ['balances', true])
    store.commit('setSearchQuery', ['balances', '12'])
    expect(wrapper.vm.filteredBalances.map(x => x.denom)).toEqual(['123'])
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should show the search on click', () => {
    wrapper.find('.ni-tool-bar i').trigger('click')
    expect(wrapper.contains('.ni-modal-search')).toBe(true)
  })

  // TODO do we test mousetrap stuff??
})
