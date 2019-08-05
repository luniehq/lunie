import { shallowMount } from "@vue/test-utils"
import { SendMessageDetails } from "src/components/transactions/message-view"
import { testTransactionObjects } from "test/unit/helpers/testValues"

describe(`SendMessageDetails`, () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(SendMessageDetails, {
      propsData: {
        transaction: testTransactionObjects[0],
        sessionAddress: "cosmos1"
      }
    })
  })
  it(`MsgSend 1 has the expected html structure`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })
  it(`MsgSend 2 has the expected html structure`, () => {
    wrapper.setProps({ transaction: testTransactionObjects[1] })
    expect(wrapper.element).toMatchSnapshot()
  })
  it(`MsgSend 3 has the expected html structure`, () => {
    wrapper.setProps({ transaction: testTransactionObjects[2] })
    expect(wrapper.element).toMatchSnapshot()
  })
  it(`MsgSend 4 has the expected html structure`, () => {
    wrapper.setProps({ transaction: testTransactionObjects[3] })
    expect(wrapper.element).toMatchSnapshot()
  })
})
