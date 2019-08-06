import { shallowMount } from "@vue/test-utils"
import TransactionMetadata from "src/components/transactions/TransactionMetadata"

describe(`TransactionMetadata`, () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(TransactionMetadata, {
      propsData: {
        time: new Date("2019-07-31"),
        block: 1234567,
        fees: {
          amount: "1234",
          denom: "uatom"
        }
      },
      stubs: [`router-link`]
    })
  })

  it(`renders correct fee and block transaction data`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })
})
