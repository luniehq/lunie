import { shallowMount } from "@vue/test-utils"
import TransactionList from "src/components/transactions/TransactionList"
import {
  messageType,
  transactionGroup
} from "src/components/transactions/messageTypes"

describe(`TransactionList`, () => {
  let wrapper

  let txs = []
  let height = 1086769
  let oneDay = 86400 // One day
  let offset = 86400 / 7 // One day / 7s block time
  let timestamp = new Date('2019-11-27T04:41:20') // cannot do new Date().getTime() because of snapshots
  let timeOffset = 0

  for (var type in messageType) {
    txs.push({
      height,
      fee: {
        amount: "37",
        denom: "uatom"
      },
      group: transactionGroup[messageType[type]],
      key: "keyhash",
      memo: "(Sent via Lunie)",
      timestamp: timestamp - timeOffset,
      liquidDate: null,
      type: messageType[type]
    })
    height += offset
    timeOffset += oneDay
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
