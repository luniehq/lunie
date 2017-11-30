import Vuex from 'vuex'
import { mount, createLocalVue } from 'vue-test-utils'
import PageCandidates from 'renderer/components/staking/PageCandidates'

const shoppingCart = require('renderer/vuex/modules/shoppingCart').default({})
const candidates = require('renderer/vuex/modules/candidates').default({})
const filters = require('renderer/vuex/modules/filters').default({})

const localVue = createLocalVue()
localVue.use(Vuex)

describe('PageCandidates', () => {
  let wrapper, store

  beforeEach(() => {
    store = new Vuex.Store({
      getters: {
        shoppingCart: () => shoppingCart.state,
        candidates: () => candidates.state,
        filters: () => filters.state
      },
      modules: {
        shoppingCart,
        candidates,
        filters
      }
    })

    store.commit('addCandidate', {
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
    store.commit('addCandidate', {
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

    wrapper = mount(PageCandidates, {
      localVue,
      store
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
  
  it('should sort the candidates by selected property', () => {
    expect(wrapper.vm.filteredCandidates.map(x => x.id)).toEqual(['idX', 'idY'])
    wrapper.vm.sort = 'voting_power'
    wrapper.update()
    expect(wrapper.vm.filteredCandidates.map(x => x.id)).toEqual(['idY', 'idX'])
  })

  it('should filter the candidates', () => {
    store.commit('setSearchVisible', ['candidates', true])
    store.commit('setSearchQuery', ['candidates', 'baseX'])
    expect(wrapper.vm.filteredCandidates.map(x => x.id)).toEqual(['idX'])
    expect(wrapper.html()).toMatchSnapshot()
    store.commit('setSearchQuery', ['candidates', 'baseY'])
    expect(wrapper.vm.filteredCandidates.map(x => x.id)).toEqual(['idY'])
  })
})
