import { shallow } from 'vue-test-utils'
import htmlBeautify from 'html-beautify'
import FundraiserWarning from 'renderer/components/common/FundraiserWarning'

describe('FundraiserWarning', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallow(FundraiserWarning)
  })

  it('has the expected html structure', () => {
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })
})
