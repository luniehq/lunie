import { shallowMount } from "@vue/test-utils"
import TransactionFees from "src/components/transactions/TransactionFees"

describe(`TransactionFees`, () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(TransactionFees, {
      propsData: {
        time: new Date("2019-07-31"),
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
