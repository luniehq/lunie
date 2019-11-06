import { shallowMount } from "@vue/test-utils"
import TransactionMetadata from "src/components/transactions/TransactionMetadata"

describe(`TransactionMetadata`, () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(TransactionMetadata, {
      propsData: {
        timestamp: new Date("2019-07-31"),
        height: 1234567,
        fee: {
          amount: "0.001234",
          denom: "ATOM"
        }
      },
      stubs: [`router-link`]
    })
  })

  it(`renders correct fee and block transaction data`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })
})
