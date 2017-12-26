import { mount } from 'vue-test-utils'
import NiTag from 'common/NiTag'

describe('NiTag', () => {
  let wrapper

  it('has the expected html structure', () => {
    wrapper = mount(NiTag, {})
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it('has the expected value', () => {
    wrapper = mount(NiTag, {
      propsData: { value: 'Value' }
    })
    expect(wrapper.vm.$el.textContent).toBe('Value')
  })

  it('has the expected classes for default size', () => {
    wrapper = mount(NiTag, {})
    expect(wrapper.find('.ni-tag').exists()).toBe(true)
    expect(wrapper.find('.ni-tag-df').exists()).toBe(true)
  })

  it('has the expected classes for small size', () => {
    wrapper = mount(NiTag, {
      propsData: { size: 'sm' }
    })
    expect(wrapper.find('.ni-tag').exists()).toBe(true)
    expect(wrapper.find('.ni-tag-sm').exists()).toBe(true)
  })

  it('has the expected classes for large size', () => {
    wrapper = mount(NiTag, {
      propsData: { size: 'lg' }
    })
    expect(wrapper.find('.ni-tag').exists()).toBe(true)
    expect(wrapper.find('.ni-tag-lg').exists()).toBe(true)
  })
})
