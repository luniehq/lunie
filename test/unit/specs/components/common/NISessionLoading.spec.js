import { mount } from '@vue/test-utils'
import htmlBeautify from 'html-beautify'
import NiSessionLoading from 'common/NiSessionLoading'

describe('NiSessionLoading', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(NiSessionLoading)
  })

  it('has the expected html structure', () => {
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })
})
