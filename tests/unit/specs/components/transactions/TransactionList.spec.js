import { shallowMount } from "@vue/test-utils"
import TransactionList from "src/components/transactions/TransactionList"
import { messageType } from "src/components/transactions/messageTypes"

describe(`TransactionList`, () => {
  let wrapper

  let txs = []
  let height = 1000000

  for (var type in messageType) {
    txs.push({
      type: messageType[type],
      hash: "A0DEB29E97A4DF38289D55D63C5724588985E1D35B26518CB66EAF96CFEF2E04",
      height,
      timestamp: new Date(Date.now()).toISOString(),
      memo: "(Sent via Lunie)",
      success: true,
      fees: [],
      details: {
        from: ["cosmosvaloper123"],
        to: ["cosmosvaloper456"],
        proposalType: "cosmos-sdk/TextProposal",
        proposalTitle: "Lunie was here!",
        proposalDescription: "Blah blah blah and blah blah blah ...",
        proposalId: 17,
        voteOption: "Yes",
        initialDeposit: {
          denom: "ATOM",
          amount: "10"
        },
        amount: {
          denom: "ATOM",
          amount: "10"
        }
      }
    })
  }

  beforeEach(() => {
    wrapper = shallowMount(TransactionList, {
      propsData: {
        transactions: txs,
        validators: {},
        address: "cosmos1"
      },
      directives: {
        infiniteScroll: () => jest.fn()
      }
    })
  })

  it(`calls loadMore script on scroll`, () => {
    const self = { $emit: jest.fn() }
    TransactionList.methods.loadMore.call(self)
    expect(self.$emit).toHaveBeenCalledWith(`loadMore`)
  })

  it(`renders a list of TransactionItems`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })
})
