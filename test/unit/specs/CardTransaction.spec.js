import { shallow } from 'vue-test-utils'
import CardTransaction from 'renderer/components/wallet/CardTransaction'

describe('CardTransaction', () => {
  let wrapper
  let propsData = {
    transactionValue: {
      tx: {
        inputs: [
          {
            coins: [{
              denom: 'jbcoins',
              amount: 1234
            }],
            sender: 'otherAddress'
          }
        ],
        outputs: [
          {
            coins: [{
              denom: 'jbcoins',
              amount: 1234
            }],
            recipient: 'myAddress'
          }
        ]
      },
      time: Date.now()
    },
    address: 'myAddress'
  }

  beforeEach(() => {
    wrapper = shallow(CardTransaction, {
      propsData
    })
  })

  it('has the expected html structure', () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
