import { mount } from 'vue-test-utils'
import htmlBeautify from 'html-beautify'
import NiDataLoading from 'common/NiDataLoading'

describe('NiDataLoading', () => {
  let wrapper
  beforeEach(() => {
    wrapper = mount(NiDataLoading)
  })

  it('has the expected html structure', () => {
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  it('should tell the user something is loading', () => {
    expect(wrapper.find('.ni-data-msg__title div').html().toLowerCase())
      .toContain('data is loading')
  })

  it('should tell the user to be patient', () => {
    expect(wrapper.find('.ni-data-msg__subtitle div').html().toLowerCase())
      .toContain('please wait a moment')
  })

})
