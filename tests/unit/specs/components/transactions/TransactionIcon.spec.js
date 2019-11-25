import { shallowMount } from "@vue/test-utils"
import TransactionIcon from "src/components/transactions/TransactionIcon"

describe(`TransactionIcon`, () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(TransactionIcon, {
      propsData: {
        transactionGroup: "banking",
        transactionType: "Sent"
      }
    })
  })

  it(`renders a banking coloured sent transaction icon`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })
})
