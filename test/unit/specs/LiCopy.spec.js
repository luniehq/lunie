import { shallow } from 'vue-test-utils'
import LiCopy from 'renderer/components/common/NiLiCopy'

describe('LiCopy', () => {
  let wrapper
  let propsData = {
    value: 12345678
  }

  beforeEach(() => {
    wrapper = shallow(LiCopy, {
      propsData
    })
  })

  it('has the expected html structure', () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it('has an address from props', () => {
    expect(wrapper.html()).toContain(propsData.value)
  })
})
