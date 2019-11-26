import { shallowMount } from "@vue/test-utils"
import TransactionItem from "src/components/transactions/TransactionItem"

import {
  messageType,
  transactionGroup
} from "src/components/transactions/messageTypes"

describe(`TransactionItem`, () => {
  let wrapper
  let txs = []
  let height = 1086769
  let offset = 1

  for (var type in messageType) {
    txs.push({
      height,
      fee: {
        amount: "37",
        denom: "uatom"
      },
      hash: `ABCD1234`,
      group: transactionGroup[messageType[type]],
      key: "keyhash",
      memo: "(Sent via Lunie)",
      timestamp: 123456789,
      liquidDate: null,
      type: messageType[type]
    })
    height += offset
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
      wrapper.vm.toggleDetail()
      expect(wrapper.html()).toContain("tx-details")
    })
  }
})
