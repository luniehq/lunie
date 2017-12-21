import { mount } from 'vue-test-utils'
import NiModal from 'common/NiModal'

describe('NiModal', () => {
  let wrapper, close

  beforeEach(() => {
    close = jest.fn()
    wrapper = mount(NiModal, {
      propsData: {
        size: null,
        icon: null,
        close
      }
    })
  })

  it('has the expected html structure', () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it('should call close on click', () => {
    wrapper.trigger('click')
    expect(close).toHaveBeenCalled()
  })

  it('should call close button click', () => {
    wrapper.find('.ni-modal-close').trigger('click')
    expect(close).toHaveBeenCalled()
  })

  it('should set size', () => {
    wrapper.setProps({size: 'fs'})
    expect(wrapper.classes()).toContain('ni-modal-fullscreen')
  })

  it('should show icon', () => {
    wrapper.setProps({icon: 'hallo_icon'})
    expect(wrapper.find('.material-icons')).toBeDefined()
    expect(wrapper.html()).toContain('hallo_icon')
  })

  it('should use slots', () => {
    wrapper = mount(NiModal, {
      slots: {
        title: '<custom-title />',
        footer: '<custom-footer />'
      }
    })
    expect(wrapper.find('custom-title')).toBeDefined()
    expect(wrapper.find('custom-footer')).toBeDefined()
  })
})
