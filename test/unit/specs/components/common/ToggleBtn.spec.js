import Vuex from 'vuex'
import { mount, createLocalVue } from '@vue/test-utils'
import TogggleBtn from 'renderer/components/common/ToggleBtn'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('TogggleBtn', () => {
  let wrapper
  let store = new Vuex.Store()
  store.commit = jest.fn()

  beforeEach(() => {
    store.commit.mockReset()
    wrapper = mount(TogggleBtn, {
      localVue,
      store,
      propsData: {
        value: 'HALLO',
        active: false
      }
    })
  })

  it('has the expected html structure', () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it('should show the provided value', () => {
    expect(wrapper.html()).toContain('HALLO')
  })

  it('should show an active state if active set', () => {
    wrapper.setProps({active: true})
    expect(wrapper.classes()).toContain('active')
  })
})
