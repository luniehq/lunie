import { shallowMount } from "@vue/test-utils"
import TransactionIcon from "src/components/transactions/TransactionIcon"

describe(`TransactionIcon`, () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(TransactionIcon, {
      propsData: {
        group: "banking"
      }
    })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })
})
