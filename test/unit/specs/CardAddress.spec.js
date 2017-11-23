import { shallow } from 'vue-test-utils'
import CardAddress from 'renderer/components/wallet/CardAddress'

describe('CardAddress', () => {
  let wrapper
  let propsData = {
    address: 12345678
  }

  beforeEach(() => {
    wrapper = shallow(CardAddress, {
      propsData: propsData
    })
  })

  it('has an address from props', () => {
    expect(wrapper.vm.address).toEqual(12345678)
  })

  it('has the expected html structure', () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it('returns an id with address-prop.address', () => {
    expect(wrapper.vm.cssId).toBe('address-12345678')
  })
})
