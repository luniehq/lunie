import { mount } from 'vue-test-utils'
import setup from '../helpers/vuex-setup'
import NiModalHelp from 'common/NiModalHelp'

describe('NiModalHelp', () => {
  let wrapper, store

  beforeEach(() => {
    let instance = setup()
    store = instance.store
    wrapper = instance.new(NiModalHelp, mount)
    store.commit('setModalHelp', true)
  })

  it('has the expected html structure', () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it('should hide', () => {
    wrapper.vm.close()
    wrapper.update()
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
