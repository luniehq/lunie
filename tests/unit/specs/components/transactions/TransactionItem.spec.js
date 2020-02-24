import { shallowMount } from "@vue/test-utils"
import TransactionItem from "src/components/transactions/TransactionItem"

import {
  messageType,
  transactionGroup
} from "src/components/transactions/messageTypes"

describe(`TransactionItem`, () => {
  describe(`Let's do this`, () => {
    describe(`TransactionItem with isExtension as false`, () => {
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
          jest.mock(`src/../config.js`, () => ({
            isExtension: false
          }))
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

    describe(`TransactionItem with isExtension as true`, () => {
      let wrapper
      let txs = [
        {
          type: `MsgSend`
        }
      ]
      const event = {
        target: {
          className: `tx__content__left`
        }
      }
      it(`doesn't flip show value if extension is set to true`, () => {
        jest.mock(`src/../config.js`, () => ({
          isExtension: true
        }))      
        wrapper = shallowMount(TransactionItem, {
          propsData: {
            transaction: txs[0],
            validators: {},
            show: false
          }
        })
        wrapper.vm.toggleDetail(event)
        expect(wrapper.vm.show).toBe(false)
      })
    })
  })
})
