import { mount } from '@vue/test-utils'
import NiPart from 'common/NiPart'

describe('NiPart', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(NiPart, { propsData: { title: 'Test' } })
  })

  it('has the expected html structure', () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it('only has header if a title is defined', () => {
    wrapper = mount(NiPart, { slots: { default: '<custom-main />' } })
    expect(wrapper.find('header').exists()).toBe(false)
    expect(wrapper.find('custom-main').exists()).toBe(true)
  })

  it('gets title from prop if defined', () => {
    wrapper = mount(NiPart, { propsData: { title: 'Test' } })
    expect(wrapper.find('.ni-part-title').text()).toBe('Test')
  })

  it('should use slots', () => {
    wrapper = mount(NiPart, {
      slots: {
        title: '<custom-title />',
        default: '<custom-main />',
        menu: '<custom-menu />'
      }
    })
    expect(wrapper.find('custom-title').exists()).toBe(true)
    expect(wrapper.find('custom-menu').exists()).toBe(true)
    expect(wrapper.find('custom-main').exists()).toBe(true)
  })
})
