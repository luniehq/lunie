import { mount } from "@vue/test-utils"
import TransactionDetails from "src/components/transactions/TransactionDetails"
import { testTransactionObjects } from "test/unit/helpers/testValues"
describe(`TransactionDetails`, () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(TransactionDetails, {
      propsData: {
        transaction: testTransactionObjects[0],
        validators: {},
        address: "cosmos1"
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
  it(`MsgUndelegate has the expected html structure`, () => {
    wrapper.setProps({ transaction: testTransactionObjects[4] })
    expect(wrapper.element).toMatchSnapshot()
  })
  it(`MsgBeginRedelegate has the expected html structure`, () => {
    wrapper.setProps({ transaction: testTransactionObjects[5] })
    expect(wrapper.element).toMatchSnapshot()
  })
  it(`MsgUndelegate has the expected html structure`, () => {
    wrapper.setProps({ transaction: testTransactionObjects[6] })
    expect(wrapper.element).toMatchSnapshot()
  })
  it(`MsgUndelegate has the expected html structure`, () => {
    wrapper.setProps({ transaction: testTransactionObjects[7] })
    expect(wrapper.element).toMatchSnapshot()
  })
  it(`MsgUndelegate has the expected html structure`, () => {
    wrapper.setProps({ transaction: testTransactionObjects[8] })
    expect(wrapper.element).toMatchSnapshot()
  })
  it(`MsgVote has the expected html structure`, () => {
    wrapper.setProps({ transaction: testTransactionObjects[9] })
    expect(wrapper.element).toMatchSnapshot()
  })
  it(`MsgDeposit has the expected html structure`, () => {
    wrapper.setProps({ transaction: testTransactionObjects[10] })
    expect(wrapper.element).toMatchSnapshot()
  })
  it(`MsgSetWithdrawAddress has the expected html structure`, () => {
    wrapper.setProps({ transaction: testTransactionObjects[11] })
    expect(wrapper.element).toMatchSnapshot()
  })
  it(`MsgSetWithdrawValidatorCommission has the expected html structure`, () => {
    wrapper.setProps({ transaction: testTransactionObjects[12] })
    expect(wrapper.element).toMatchSnapshot()
  })
  it(`MsgUnjail has the expected html structure`, () => {
    wrapper.setProps({ transaction: testTransactionObjects[13] })
    expect(wrapper.element).toMatchSnapshot()
  })
  it(`MsgCreateValidator has the expected html structure`, () => {
    wrapper.setProps({ transaction: testTransactionObjects[14] })
    expect(wrapper.element).toMatchSnapshot()
  })
  it(`MsgEditValidator has the expected html structure`, () => {
    wrapper.setProps({ transaction: testTransactionObjects[15] })
    expect(wrapper.element).toMatchSnapshot()
  })
  it(`Unknown transaction returns empty string`, () => {
    wrapper.setProps({ transaction: { type: "Unknown" } })
    expect(wrapper.element).toMatchSnapshot()
  })
})
