import { shallowMount } from "@vue/test-utils"
import TransactionFees from "src/components/transactions/TransactionFees"

describe(`TransactionFees`, () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(TransactionFees, {
      propsData: {
        time:
          "Thu Jul 18 2019 12:03:11 GMT+0200 (Central European Summer Time)",
        block: 1234567,
        fees: {
          amount: "1234",
          denom: "uatom"
        }
      }
    })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })
})
