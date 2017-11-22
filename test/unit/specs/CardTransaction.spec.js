import { shallow } from 'vue-test-utils'
import CardTransaction from '../../../app/src/renderer/components/wallet/CardTransaction'

describe('CardTransaction', () => {
  let wrapper, num, result
  let propsData = {
    transactionValue: {
      tx: {
        inputs: [
          {
            coins: {
              denom: 'jbcoins',
              amount: 1234
            }
          }
        ]
      },
      // fixing date to relative date as fixed number produces different results in different timezones
      time: new Date(1987, 8, 16)
    }
  }

  beforeEach(() => {
    wrapper = shallow(CardTransaction, {
      propsData
    })
  })

  it('has the expected html structure', () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it('returns negative as a string for numbers below zero', () => {
    num = -1
    result = wrapper.vm.sign(num)

    expect(result).toEqual('negative')
  })

  it('returns positive as a string for numbers above zero', () => {
    num = 1
    result = wrapper.vm.sign(num)

    expect(result).toEqual('positive')
  })
})
