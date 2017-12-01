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
  
  it('should show incoming transcations', () => {
    expect(wrapper.find('.value').hasClass('positive')).toBe(true)
  })
  
  it('should show outgoing transcations', () => {
    wrapper.setProps({
      transactionValue: {
        tx: {
          inputs: [
            {
              coins: [{
                denom: 'jbcoins',
                amount: 1234
              }],
              sender: 'myAddress'
            }
          ],
          outputs: [
            {
              coins: [{
                denom: 'jbcoins',
                amount: 1234
              }],
              recipient: 'otherAddress'
            }
          ]
        },
        time: Date.now()
      },
      address: 'myAddress'
    })
    expect(wrapper.find('.value').hasClass('negative')).toBe(true)
  })
  
  it('should show all coins of the transaction', () => {
    wrapper.setProps({
      transactionValue: {
        tx: {
          inputs: [
            {
              coins: [{
                denom: 'jbcoins',
                amount: 1234
              }, {
                denom: 'fabocoins',
                amount: 1
              }, {
                denom: 'mattcoins',
                amount: 42
              }],
              sender: 'otherAddress'
            }
          ],
          outputs: [{
            coins: [{
              denom: 'jbcoins',
              amount: 1234
            }, {
              denom: 'fabocoins',
              amount: 1
            }, {
              denom: 'mattcoins',
              amount: 42
            }],
            recipient: 'myAddress'
          }]
        },
        time: Date.now()
      },
      address: 'myAddress'
    })
    expect(wrapper.findAll('.key-value').length).toBe(3)
    expect(wrapper.findAll('.key-value').at(2).html().toLowerCase()).toContain('mattcoins')
    expect(wrapper.findAll('.key-value').at(2).html()).toContain('42')
  })
})
