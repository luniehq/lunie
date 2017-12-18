import { mount } from 'vue-test-utils'
import htmlBeautify from 'html-beautify'
import NiFieldGroup from 'common/NiFieldGroup'

describe('NiFieldGroup', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(NiFieldGroup)
  })

  it('has the expected html structure', () => {
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

})
