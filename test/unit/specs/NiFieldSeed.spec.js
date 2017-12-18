import { mount } from 'vue-test-utils'
import htmlBeautify from 'html-beautify'
import NiFieldSeed from 'common/NiFieldSeed'

describe('NiFieldSeed', () => {
  let wrapper

  let propsData = {
    value: 'one two three four five six seven eight nine ten eleven twelve' 
  }

  beforeEach(() => {
    wrapper = mount(NiFieldSeed, { propsData })
  })

  it('has a value from props', () => {
    expect(wrapper.vm.value).toContain('one two three four five six seven eight nine ten eleven twelve')
  })

  it('has the expected html structure', () => {
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

})
