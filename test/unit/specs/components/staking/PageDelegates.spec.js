import setup from '../../../helpers/vuex-setup'
import htmlBeautify from 'html-beautify'
import PageDelegates from 'renderer/components/staking/PageDelegates'

describe('PageDelegates', () => {
  let wrapper, store
  let {mount} = setup()

  beforeEach(() => {
    let instance = mount(PageDelegates)
    wrapper = instance.wrapper
    store = instance.store

    store.state.user.address = 'abc'
    store.commit('setAtoms', 1337)
    store.commit('addDelegate', {
      pub_key: {
        type: 'ed25519',
        data: 'pubkeyX'
      },
      voting_power: 10000,
      shares: 5000,
      description: {
        description: 'descriptionX',
        moniker: 'candidateX',
        country: 'USA'
      }
    })
    store.commit('addDelegate', {
      pub_key: {
        type: 'ed25519',
        data: 'pubkeyY'
      },
      voting_power: 30000,
      shares: 10000,
      description: {
        description: 'descriptionY',
        moniker: 'candidateY',
        country: 'Canada'
      }
    })
    wrapper.update()
  })

  it('has the expected html structure', () => {
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  it('should show the search on click', () => {
    wrapper.find('.ni-tool-bar i').trigger('click')
    expect(wrapper.contains('.ni-modal-search')).toBe(true)
  })

  it('should refresh candidates on click', () => {
    wrapper.findAll('.ni-tool-bar i').at(1).trigger('click')
    expect(store.dispatch).toHaveBeenCalledWith('getDelegates')
  })

  it('should sort the delegates by selected property', () => {
    expect(wrapper.vm.filteredDelegates.map(x => x.id)).toEqual(['pubkeyY', 'pubkeyX'])

    wrapper.vm.sort.property = 'id'
    wrapper.vm.sort.order = 'desc'
    expect(wrapper.vm.filteredDelegates.map(x => x.id)).toEqual(['pubkeyY', 'pubkeyX'])
  })

  it('should filter the delegates', () => {
    store.commit('setSearchVisible', ['delegates', true])
    store.commit('setSearchQuery', ['delegates', 'dateX'])
    expect(wrapper.vm.filteredDelegates.map(x => x.id)).toEqual(['pubkeyX'])
    wrapper.update()
    expect(wrapper.vm.$el).toMatchSnapshot()
    store.commit('setSearchQuery', ['delegates', 'dateY'])
    expect(wrapper.vm.filteredDelegates.map(x => x.id)).toEqual(['pubkeyY'])
  })

  it('should show the amount of selected delegates', () => {
    store.commit('addToCart', store.state.delegates.delegates[0])
    store.commit('addToCart', store.state.delegates.delegates[1])
    wrapper.update()
    expect(wrapper.find('.fixed-button-bar strong').text().trim()).toContain('2')
  })

  it('should show placeholder if delegates are loading', () => {
    let {wrapper} = mount(PageDelegates, {
      getters: {
        delegates: () => ({
          delegates: [],
          loading: true
        })
      },
      stubs: {
        'data-loading': '<data-loading />'
      }
    })

    expect(wrapper.contains('data-loading')).toBe(true)
  })
})
