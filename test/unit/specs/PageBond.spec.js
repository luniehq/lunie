import setup from '../helpers/vuex-setup'
import PageBond from 'renderer/components/staking/PageBond'

describe('PageBond', () => {
  let wrapper
  let {mount} = setup()

  beforeEach(() => {
    let instance = mount(PageBond)
    wrapper = instance.wrapper
  })

  it('has the expected html structure', () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
