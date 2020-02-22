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
  const event = {
    target: {
      className: `tx__content__left`
    }
  }

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
      wrapper.vm.toggleDetail(event)
      expect(wrapper.html()).toContain("tx-details")
    })
  }
})

// // Will break other tests
// jest.mock(`src/../config.js`, () => ({
//   isExtension: true
// }))

// describe(`TransactionItem with isExtension as true`, () => {
//   let wrapper
//   let txs = [
//     {
//       type: `MsgSend`
//     }
//   ]
//   const event = {
//     target: {
//       className: `tx__content__left`
//     }
//   }
//   it(`doesn't flip show value if extension is set to true`, () => {
//     wrapper = shallowMount(TransactionItem, {
//       propsData: {
//         transaction: txs[0],
//         validators: {},
//         show: false
//       }
//     })
//     wrapper.vm.toggleDetail(event)
//     // TODO: Cannot test this because of jest.mock of the config module breaking all other tests here
//     // expect(wrapper.vm.show).toBe(false)
//     expect(wrapper.vm.show).toBe(true)
//   })
// })
