import { shallowMount } from "@vue/test-utils"
import TransactionIcon from "src/components/transactions/TransactionIcon"

describe(`TransactionIcon`, () => {
  let wrapper

  const transactions = [
    {
      type: `Sent`,
    },
    {
      type: `Received`,
    },
    {
      type: `Staked`,
    },
    {
      type: `Restaked`,
    },
    {
      type: `Unstaked`,
    },
    {
      type: `Claimed`,
    },
    {
      type: `Voted`,
    },
    {
      type: `Deposit`,
    },
    {
      type: `Submitted`,
    },
  ]

  for (let i = 0; i < transactions.length; i++) {
    it(`renders a ${transactions[i].type} transaction icon`, () => {
      wrapper = shallowMount(TransactionIcon, {
        propsData: {
          transactionType: transactions[i].type,
        },
      })
      expect(wrapper.element).toMatchSnapshot()
      expect(wrapper.find(".tx__icon img").attributes("src")).toEqual(
        `/img/icons/activity/${transactions[i].type}.svg`
      )
    })
  }
})
