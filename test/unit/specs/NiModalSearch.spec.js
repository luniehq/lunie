import Vuex from 'vuex'
import { mount } from 'vue-test-utils'
import NiModalSearch from 'common/NiModalSearch'
import setup from '../helpers/vuex-setup'

describe('NiModalSearch', () => {
  let wrapper, store

  global.console.error = () => {}

  beforeEach(() => {
    let instance = setup()
    store = instance.store
    wrapper = instance.new(NiModalSearch, mount, {
      type: 'transactions'
    })
    store.commit('setSearchVisible', ['transactions', true])
    wrapper.update()
  })

  it('has the expected html structure', () => {
    expect(wrapper.html()).not.toBeUndefined()
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it('should close', () => {
    wrapper.find('button').trigger('click')
    expect(store.commit).toHaveBeenCalledWith('setSearchVisible', ['transactions', false])
    expect(wrapper.html()).toBeUndefined()
  })

  it('should show search query', () => {
    store.commit('setSearchQuery', ['transactions', 'abc'])
    expect(wrapper.vm.query).toBe('abc')
  })

  it('should update the search query', () => {
    wrapper.vm.query = 'def'
    expect(store.commit).toHaveBeenCalledWith('setSearchQuery', ['transactions', 'def'])
  })
})
