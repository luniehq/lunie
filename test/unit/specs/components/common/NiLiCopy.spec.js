import { mount } from '@vue/test-utils'
import NiLiCopy from 'common/NiLiCopy'

describe('NiLiCopy', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(NiLiCopy)
  })

  it('has the expected html structure', () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it('should show the provided value', () => {
    wrapper.setProps({value: 'HALLO'})
    expect(wrapper.html()).toContain('HALLO')
  })
})
