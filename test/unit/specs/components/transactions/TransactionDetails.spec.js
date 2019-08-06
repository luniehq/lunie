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
  it(`renders MsgSend transaction item unrelated to session user`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })
  it(`renders MsgSend transaction item from session user to other`, () => {
    wrapper.setProps({ transaction: testTransactionObjects[1] })
    expect(wrapper.element).toMatchSnapshot()
  })
  it(`renders MsgSend transaction item to yourself`, () => {
    wrapper.setProps({ transaction: testTransactionObjects[2] })
    expect(wrapper.element).toMatchSnapshot()
  })
  it(`renders MsgSend transaction item from other to you`, () => {
    wrapper.setProps({ transaction: testTransactionObjects[3] })
    expect(wrapper.element).toMatchSnapshot()
  })
  it(`renders MsgUndelegate transaction item`, () => {
    wrapper.setProps({ transaction: testTransactionObjects[4] })
    expect(wrapper.element).toMatchSnapshot()
  })
  it(`renders MsgBeginRedelegate transaction item`, () => {
    wrapper.setProps({ transaction: testTransactionObjects[5] })
    expect(wrapper.element).toMatchSnapshot()
  })
  it(`renders MsgDelegate transaction item`, () => {
    wrapper.setProps({ transaction: testTransactionObjects[6] })
    expect(wrapper.element).toMatchSnapshot()
  })
  it(`renders MsgWithdrawDelegationReward transaction item`, () => {
    wrapper.setProps({ transaction: testTransactionObjects[7] })
    expect(wrapper.element).toMatchSnapshot()
  })
  it(`renders MsgSubmitProposal transaction item`, () => {
    wrapper.setProps({ transaction: testTransactionObjects[8] })
    expect(wrapper.element).toMatchSnapshot()
  })
  it(`renders MsgVote transaction item`, () => {
    wrapper.setProps({ transaction: testTransactionObjects[9] })
    expect(wrapper.element).toMatchSnapshot()
  })
  it(`renders MsgDeposit transaction item`, () => {
    wrapper.setProps({ transaction: testTransactionObjects[10] })
    expect(wrapper.element).toMatchSnapshot()
  })
  it(`renders MsgSetWithdrawAddress transaction item`, () => {
    wrapper.setProps({ transaction: testTransactionObjects[11] })
    expect(wrapper.element).toMatchSnapshot()
  })
  it(`renders MsgSetWithdrawValidatorCommission transaction item`, () => {
    wrapper.setProps({ transaction: testTransactionObjects[12] })
    expect(wrapper.element).toMatchSnapshot()
  })
  it(`renders MsgUnjail transaction item`, () => {
    wrapper.setProps({ transaction: testTransactionObjects[13] })
    expect(wrapper.element).toMatchSnapshot()
  })
  it(`renders MsgCreateValidator transaction item`, () => {
    wrapper.setProps({ transaction: testTransactionObjects[14] })
    expect(wrapper.element).toMatchSnapshot()
  })
  it(`renders MsgEditValidator transaction item`, () => {
    wrapper.setProps({ transaction: testTransactionObjects[15] })
    expect(wrapper.element).toMatchSnapshot()
  })
  it(`Unknown transaction returns empty string`, () => {
    wrapper.setProps({ transaction: { type: "Unknown" } })
    expect(wrapper.element).toMatchSnapshot()
  })
})
