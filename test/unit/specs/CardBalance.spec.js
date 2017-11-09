import Vue from 'vue'
import CardBalance from '../../../app/src/renderer/components/wallet/CardBalance'

describe('CardBalance', () => {
  let Cmp, vm
  let propsData = {
    balance: {
      denom: 'jbcoin',
      amount: 1234.56
    }
  }

  beforeEach(() => {
    Cmp = Vue.extend(CardBalance)
    vm = new Cmp({ propsData: propsData }).$mount()
  })

  it('has the expected html structure', () => {
    expect(vm.$el).toMatchSnapshot()
  })
})
