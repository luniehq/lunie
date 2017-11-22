import { shallow } from 'vue-test-utils'
import CardBalance from '../../../app/src/renderer/components/wallet/CardBalance'

describe('CardBalance', () => {
  let wrapper
  let propsData = {
    balance: {
      denom: 'jbcoin',
      amount: 1234.56
    }
  }

  beforeEach(() => {
    wrapper = shallow(CardBalance, {
      propsData: propsData
    })
  })

  it('has a value from props', () => {
    expect(wrapper.vm.balance).toEqual(
      {
        denom: 'jbcoin',
        amount: 1234.56
      }
    )
  })

  it('has the expected html structure', () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
