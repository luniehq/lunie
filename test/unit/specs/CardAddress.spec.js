import Vue from 'vue'
import CardAddress from '../../../app/src/renderer/components/wallet/CardAddress'

describe('CardAddress', () => {
  let Cmp, vm
  let propsData = {
    address: 12345678
  }

  beforeEach(() => {
    Cmp = Vue.extend(CardAddress)
    vm = new Cmp({ propsData: propsData }).$mount()
  })

  it('has the expected html structure', () => {
    expect(vm.$el).toMatchSnapshot()
  })
})
