import { shallowMount } from "@vue/test-utils"
import TransactionList from "src/components/transactions/TransactionList"
import { messageType } from "src/components/transactions/messageTypes"

describe(`TransactionList`, () => {
  let wrapper

  let txs = []
  let height = 1086769
  let offset = 86400 / 7 // One day / 7s block time

  // Return a fixed timestamp when moment().format() is called
  jest.mock("moment", () => () => ({
    format: () => "27/11/2019 0:00:00"
  }))

  for (var type in messageType) {
    txs.push({
      type: messageType[type],
      hash: "A0DEB29E97A4DF38289D55D63C5724588985E1D35B26518CB66EAF96CFEF2E04",
      height,
      timestamp: "2020-02-10T10:15:51Z",
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
    height += offset
  }

  beforeEach(() => {
    wrapper = shallowMount(TransactionList, {
      propsData: {
        transactions: txs,
        validators: {},
        address: "cosmos1"
      }
    })
  })

  it(`renders a list of TransactionItems`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })
})
