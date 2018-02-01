import { mount } from '@vue/test-utils'
import htmlBeautify from 'html-beautify'
import NiDataError from 'common/NiDataError'

describe('NiDataError', () => {
  let wrapper
  beforeEach(() => {
    wrapper = mount(NiDataError)
  })

  it('has the expected html structure', () => {
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  it('has an icon', () => {
    expect(wrapper.find('.ni-data-msg__icon i.material-icons').text().trim())
      .toBe('sentiment_very_dissatisfied')
  })

  it('has a title', () => {
    expect(wrapper.find('.ni-data-msg__title div').text().trim())
      .toBe('Aw shucks!')
  })

  it('has a subtitle', () => {
    expect(wrapper.find('.ni-data-msg__subtitle div').text().trim())
      .toContain('Even though you\'re connected a full node, we can\'t display this data for you right now.')
  })
})
