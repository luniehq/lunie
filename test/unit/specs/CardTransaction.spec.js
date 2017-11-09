import Vue from 'vue'
import CardTransaction from '../../../app/src/renderer/components/wallet/CardTransaction'

describe('CardTransaction', () => {
  let Cmp, vm
  let propsData = {
    transactionValue: {
      tx: {
        inputs: [
          {
            coin: {
              denom: 'jbcoins',
              amount: 1234
            }
          }
        ]
      },
      time: 1000
    }
  }

  beforeEach(() => {
    Cmp = Vue.extend(CardTransaction)
    vm = new Cmp({ propsData: propsData }).$mount()
  })

  it('has the expected html structure', () => {
    expect(vm.$el).toMatchSnapshot()
  })
})
