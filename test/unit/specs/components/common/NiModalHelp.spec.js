import setup from '../../../helpers/vuex-setup'
import NiModalHelp from 'common/NiModalHelp'

describe('NiModalHelp', () => {
  let wrapper, store
  let { mount } = setup()

  beforeEach(() => {
    let instance = mount(NiModalHelp)
    wrapper = instance.wrapper
    store = instance.store
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
