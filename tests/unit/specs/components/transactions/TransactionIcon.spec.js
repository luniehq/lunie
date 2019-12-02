import { shallowMount } from "@vue/test-utils"
import TransactionIcon from "src/components/transactions/TransactionIcon"

describe(`TransactionIcon`, () => {
  let wrapper

  const transactions = [
    {
      type: `Sent`,
      group: `banking`
    },
    {
      type: `Received`,
      group: `banking`
    },
    {
      type: `Staked`,
      group: `staking`
    },
    {
      type: `Restaked`,
      group: `staking`
    },
    {
      type: `Unstaked`,
      group: `staking`
    },
    {
      type: `Claimed`,
      group: `distribution`
    },
    {
      type: `Update`,
      group: `distribution`
    },
    {
      type: `Voted`,
      group: `governance`
    },
    {
      type: `Deposit`,
      group: `governance`
    },
    {
      type: `Submitted`,
      group: `governance`
    },
    {
      type: `Create`,
      group: `staking`
    },
    {
      type: `Edit`,
      group: `staking`
    },
    {
      type: `Unjail`,
      group: `staking`
    }
  ]

  for (let i = 0; i < transactions.length; i++) {
    it(`renders a ${transactions[i].type} transaction icon`, () => {
      wrapper = shallowMount(TransactionIcon, {
        propsData: {
          transactionGroup: transactions[i].group,
          transactionType: transactions[i].type
        }
      })
      expect(wrapper.element).toMatchSnapshot()
      expect(wrapper.find(".tx__icon img").classes()).toContain(
        transactions[i].group
      )
      expect(wrapper.find(".tx__icon img").attributes("src")).toEqual(
        `/img/icons/activity/${transactions[i].type}.svg`
      )
    })
  }
})
