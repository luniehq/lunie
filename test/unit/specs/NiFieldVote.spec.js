import { mount } from 'vue-test-utils'
import htmlBeautify from 'html-beautify'
import NiFieldVote from 'common/NiFieldVote'

describe('NiFieldVote', () => {
  let wrapper

  let propsData = {
    dt: 'No',
    dd: 0.337,
    color: 'hsl(0,50%,35%)',
    active: true,
    results: true
  }

  beforeEach(() => {
    wrapper = mount(NiFieldVote, { propsData })
  })

  it('has a color from props', () => {
    expect(wrapper.vm.color).toBe('hsl(0,50%,35%)')
  })

  it('has the expected html structure', () => {
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  it('shows the title of the vote option', () => {
    expect(wrapper.find('.ni-field-vote-dt').text().trim()).toBe('No')
  })

  it('has been selected by the user', () => {
    expect(wrapper.find('.ni-field-vote-input i.material-icons').text().trim())
      .toBe('radio_button_checked')
  })

  it('shows the percentage who voted', () => {
    expect(wrapper.find('.ni-field-vote-dd').text().trim()).toBe('34%')
  })

})
