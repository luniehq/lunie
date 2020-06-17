import { shallowMount } from "@vue/test-utils"
import TransactionItem from "src/components/transactions/TransactionItem"
import { messageType } from "src/components/transactions/messageTypes"

describe(`TransactionItem`, () => {
  let wrapper
  let txs = []
  let height = 1086769
  let offset = 1
  const event = {
    target: {
      className: `tx__content__left`,
    },
  }

  for (var type in messageType) {
    txs.push({
      type: messageType[type],
      hash: "A0DEB29E97A4DF38289D55D63C5724588985E1D35B26518CB66EAF96CFEF2E04",
      height,
      timestamp: "2020-02-10T10:15:51Z",
      memo: "",
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
          amount: "10",
        },
        amount: {
          denom: "ATOM",
          amount: "10",
        },
        blockExplorerLink:
          "https://awesome.blockexplorer.io/transactions/A0DEB29E97A4DF38289D55D63C5724588985E1D35B26518CB66EAF96CFEF2E04",
      },
    })
    height += offset
  }

  for (let i = 0; i < txs.length; i++) {
    it(`renders a ${txs[i].type} transaction item`, () => {
      wrapper = shallowMount(TransactionItem, {
        propsData: {
          transaction: txs[i],
          validators: {},
          address: "cosmos1",
        },
        mocks: {
          $store: {
            getters: {
              isExtension: false,
            },
          },
        },
      })
      expect(wrapper.element).toMatchSnapshot()
      wrapper.vm.toggleDetail(event)
      expect(wrapper.html()).toContain("tx-details")
    })
  }
})
