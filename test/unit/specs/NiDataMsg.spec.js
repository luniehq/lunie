import { mount } from 'vue-test-utils'
import htmlBeautify from 'html-beautify'
import NiDataMsg from 'common/NiDataMsg'

describe('NiDataMsg', () => {
  let wrapper

  let propsData = {
    title: 'sOmEtHiNg Is HaPpEnIng!!!',
    subtitle: 'Oh my! What could it be?',
    icon: 'help',
    spin: true
  }

  beforeEach(() => {
    wrapper = mount(NiDataMsg, { propsData })
  })

  it('has a title from props', () => {
    expect(wrapper.vm.title.toLowerCase()).toContain('something is happening!!!')
  })

  it('has the expected html structure', () => {
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  it('has a visible icon', () => {
    expect(wrapper.find('.ni-data-msg__icon i.material-icons').html().toLowerCase())
      .toContain('help')
  })

  it('has a visible subtitle', () => {
    expect(wrapper.find('.ni-data-msg__subtitle').html().toLowerCase())
      .toContain('oh my! what could it be?')
  })

})
