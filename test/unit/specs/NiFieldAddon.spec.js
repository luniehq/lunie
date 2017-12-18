import { mount } from 'vue-test-utils'
import htmlBeautify from 'html-beautify'
import NiFieldAddon from 'common/NiFieldAddon'

describe('NiFieldAddon', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(NiFieldAddon)
  })

  it('has the expected html structure', () => {
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

})
