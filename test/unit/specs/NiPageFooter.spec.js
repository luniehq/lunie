import { mount } from 'vue-test-utils'
import NiPageFooter from 'common/NiPageFooter'

describe('NiPageFooter', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(NiPageFooter)
  })

  it('has the expected html structure', () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
