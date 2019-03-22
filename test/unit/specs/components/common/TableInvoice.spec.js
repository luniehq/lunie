import { shallowMount, createLocalVue } from "@vue/test-utils"
import TableInvoice from "renderer/components/common/TableInvoice"

describe(`TableInvoice`, () => {
  let wrapper
  const localVue = createLocalVue()
  localVue.directive(`tooltip`, () => { })

  beforeEach(() => {
    wrapper = shallowMount(TableInvoice, {
      localVue,
      propsData: {
        amount: 1,
        gasEstimate: 1234567,
        gasPrice: 2.5e-8
      }
    })
  })

  it(`should show the transaction invoice summary`, async () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
