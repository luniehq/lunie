import { mount } from 'vue-test-utils'
import htmlBeautify from 'html-beautify'
import NiFormMsg from 'common/NiFormMsg'

describe('NiFormMsg', () => {
  let wrapper

  let propsData = {
    type: 'length',
    body: '',
    name: 'Password',
    min: 16,
    max: 255,
    length: ''
  }

  beforeEach(() => {
    wrapper = mount(NiFormMsg, { propsData })
  })

  it('has a type from props', () => {
    expect(wrapper.vm.type).toBe('length')
  })

  it('has the expected html structure', () => {
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  it('shows the correct message', () => {
    expect(wrapper.find('.ni-form-msg').text().trim())
      .toContain('Password must be between 16 and 255 characters')
  })
})
