import { shallowMount } from "@vue/test-utils"
import TransactionItem from "src/components/transactions/TransactionItem"
import {
  messageType,
  transactionGroup
} from "src/components/transactions/messageTypes"

describe(`TransactionItem`, () => {
  let wrapper
  let txs = []
  let blockNumber = 1086769
  let offset = 1

  for (var type in messageType) {
    txs.push({
      blockNumber,
      fees: {
        amount: "37",
        denom: "uatom"
      },
      group: transactionGroup[messageType[type]],
      key: "keyhash",
      memo: "(Sent via Lunie)",
      time: new Date("2019-07-31"),
      liquidDate: null,
      type: messageType[type]
    })
    blockNumber += offset
  }

  for (let i = 0; i < txs.length; i++) {
    it(`renders a ${txs[i].type} transaction item`, () => {
      wrapper = shallowMount(TransactionItem, {
        propsData: {
          transaction: txs[i],
          validators: {},
          address: "cosmos1"
        }
      })
      expect(wrapper.element).toMatchSnapshot()
    })
  }
})
