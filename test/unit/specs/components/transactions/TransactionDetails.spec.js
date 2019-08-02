import { shallowMount } from "@vue/test-utils"
import TransactionDetails from "src/components/transactions/TransactionDetails"
import { testTransactionObjects } from "test/unit/helpers/testValues"
describe(`TransactionDetails`, () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(TransactionDetails, {
      propsData: {
        transaction: testTransactionObjects[0],
        validators: {},
        address: "cosmos1"
      }
    })
  })

  it(`MsgSend has the expected html structure`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })
  it(`MsgUndelegate has the expected html structure`, () => {
    wrapper.setProps({ transaction: testTransactionObjects[1] })
    expect(wrapper.element).toMatchSnapshot()
  })
  it(`MsgBeginRedelegate has the expected html structure`, () => {
    wrapper.setProps({ transaction: testTransactionObjects[2] })
    expect(wrapper.element).toMatchSnapshot()
  })
  it(`MsgUndelegate has the expected html structure`, () => {
    wrapper.setProps({ transaction: testTransactionObjects[3] })
    expect(wrapper.element).toMatchSnapshot()
  })
  it(`MsgUndelegate has the expected html structure`, () => {
    wrapper.setProps({ transaction: testTransactionObjects[4] })
    expect(wrapper.element).toMatchSnapshot()
  })
})
