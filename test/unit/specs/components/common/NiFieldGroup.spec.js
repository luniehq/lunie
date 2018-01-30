import { mount } from '@vue/test-utils'
import htmlBeautify from 'html-beautify'
import NiFieldGroup from 'common/NiFieldGroup'

describe('NiFieldGroup', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(NiFieldGroup, {
      slots: {
        default: '<input class="fake-field" placeholder="Fake">'
      }
    })
  })

  it('has the expected html structure', () => {
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  it('has a slot with a field', () => {
    expect(wrapper.findAll('.fake-field').length).toBe(1)
  })
})
