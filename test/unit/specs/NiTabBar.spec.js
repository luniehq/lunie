import { mount } from 'vue-test-utils'
import NiTabBar from 'common/NiTabBar'

describe('NiTabBar', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(NiTabBar, {
      slots: {
        default: '<main-slot />'
      }
    })
  })

  it('has the expected html structure', () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
