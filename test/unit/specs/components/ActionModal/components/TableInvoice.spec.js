import { shallowMount, createLocalVue } from "@vue/test-utils"
import TableInvoice from "src/ActionModal/components/TableInvoice"

describe(`TableInvoice`, () => {
  let wrapper
  const localVue = createLocalVue()
  localVue.directive(`tooltip`, () => {})

  beforeEach(() => {
    wrapper = shallowMount(TableInvoice, {
      localVue,
      propsData: {
        amount: 1,
        gasEstimate: 1234567,
        gasPrice: 2.5e-8,
        bondDenom: `STAKE`
      }
    })
  })

  it(`should show the transaction invoice summary`, async () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
