import { mount } from '@vue/test-utils'
import htmlBeautify from 'html-beautify'
import NiDataEmptySearch from 'common/NiDataEmptySearch'

describe('NiDataEmptySearch', () => {
  let wrapper
  beforeEach(() => {
    wrapper = mount(NiDataEmptySearch)
  })

  it('has the expected html structure', () => {
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  it('has an icon', () => {
    expect(wrapper.find('.ni-data-msg__icon i.material-icons').text().trim())
      .toBe('search')
  })

  it('has a title', () => {
    expect(wrapper.find('.ni-data-msg__title div').text().trim())
      .toBe('No Results')
  })

  it('has a subtitle', () => {
    expect(wrapper.find('.ni-data-msg__subtitle div').text().trim())
      .toBe('Your search did not match any available data.')
  })
})
