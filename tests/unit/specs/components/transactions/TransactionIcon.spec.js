import { shallowMount } from "@vue/test-utils"
import TransactionIcon from "src/components/transactions/TransactionIcon"

describe(`TransactionIcon`, () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(TransactionIcon, {
      propsData: {
        transactionGroup: "banking"
      }
    })
  })

  it(`renders a banking coloured icon`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })
})
