import { mount } from '@vue/test-utils'
import htmlBeautify from 'html-beautify'
import NiModalError from 'common/NiModalError'

describe('NiModalError', () => {
  let wrapper
  beforeEach(() => {
    wrapper = mount(NiModalError)
  })

  it('has the expected html structure', () => {
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  it('has an icon', () => {
    expect(wrapper.find('.ni-modal-error__icon i.material-icons').text().trim())
      .toBe('error_outline')
  })

  it('has a title', () => {
    expect(wrapper.find('.ni-modal-error__title').text().trim())
      .toBe('Voyager ran into an error')
  })

  it('has a body', () => {
    expect(wrapper.find('.ni-modal-error__body').text().trim())
      .toContain('Voyager has encountered a critical error that blocks the app from running. Please create an issue and include a copy of the app logs.')
  })
})
