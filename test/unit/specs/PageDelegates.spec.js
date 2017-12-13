import Vuex from 'vuex'
import { mount, createLocalVue } from 'vue-test-utils'
import PageDelegates from 'renderer/components/staking/PageDelegates'

const shoppingCart = require('renderer/vuex/modules/shoppingCart').default({})
const delegates = require('renderer/vuex/modules/delegates').default({})
const filters = require('renderer/vuex/modules/filters').default({})

const localVue = createLocalVue()
localVue.use(Vuex)

describe('PageDelegates', () => {
  let wrapper, store

  beforeEach(() => {
    store = new Vuex.Store({
      getters: {
        shoppingCart: () => shoppingCart.state.delegates,
        delegates: () => delegates.state,
        filters: () => filters.state
      },
      modules: {
        shoppingCart,
        delegates,
        filters
      }
    })

    store.commit('addDelegate', {
      pubkey: 'pubkeyY',
      description: JSON.stringify({
        id: 'idY',
        description: 'descriptionY',
        voting_power: 30000,
        shares: 10000,
        keybaseID: 'keybaseY',
        country: 'Canada'
      })
    })
    store.commit('addDelegate', {
      pubkey: 'pubkeyX',
      description: JSON.stringify({
        id: 'idX',
        description: 'descriptionX',
        voting_power: 2000,
        shares: 5000,
        keybaseID: 'keybaseX',
        country: 'USA'
      })
    })

    wrapper = mount(PageDelegates, {
      localVue,
      store,
      stubs: {
        'data-error': '<data-error />'
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

  it('should sort the delegates by selected property', () => {
    expect(wrapper.vm.filteredDelegates.map(x => x.id)).toEqual(['idX', 'idY'])
    wrapper.vm.sort = 'voting_power'
    expect(wrapper.vm.filteredDelegates.map(x => x.id)).toEqual(['idY', 'idX'])
  })

  it('should filter the delegates', () => {
    store.commit('setSearchVisible', ['delegates', true])
    store.commit('setSearchQuery', ['delegates', 'baseX'])
    expect(wrapper.vm.filteredDelegates.map(x => x.id)).toEqual(['idX'])
    expect(wrapper.html()).toMatchSnapshot()
    store.commit('setSearchQuery', ['delegates', 'baseY'])
    expect(wrapper.vm.filteredDelegates.map(x => x.id)).toEqual(['idY'])
  })

  it('should show the amount of selected delegates', () => {
    store.commit('addToCart', store.state.delegates[0])
    store.commit('addToCart', store.state.delegates[1])
    wrapper.update()
    expect(wrapper.html()).toContain('2 Selected')
  })

  it('should show an error if there are no delegates', () => {
    let store = new Vuex.Store({
      getters: {
        shoppingCart: () => shoppingCart.state,
        delegates: () => [],
        filters: () => filters.state
      },
      modules: {
        shoppingCart,
        delegates,
        filters
      }
    })

    let wrapper = mount(PageDelegates, {
      localVue,
      store,
      stubs: {
        'data-error': '<data-error />'
      }
    })

    expect(wrapper.contains('data-error')).toBe(true)
  })
})
