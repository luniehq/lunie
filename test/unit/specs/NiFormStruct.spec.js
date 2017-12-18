import { mount } from 'vue-test-utils'
import htmlBeautify from 'html-beautify'
import NiFormStruct from 'common/NiFormStruct'

describe('NiFormStruct', () => {
  let wrapper

  let propsData = {
    width: 'narrow',
    submit: function () {
      console.log('form successfully submitted')
    }
  }

  beforeEach(() => {
    wrapper = mount(NiFormStruct, { propsData })
  })

  it('has a width from props', () => {
    expect(wrapper.vm.width).toBe('narrow')
  })

  it('has a submit function', () => {
    expect(wrapper.vm.submit).toBeTruthy()
  })

  it('has the expected html structure', () => {
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })
})
