import { shallowMount } from "@vue/test-utils"
import TransactionIcon from "src/components/transactions/TransactionIcon"

describe(`TransactionIcon`, () => {
  let wrapper

  const transactions = [
    {
      type: `Sent`,
      group: `banking`,
      icon: `Sent`
    },
    {
      type: `Received`,
      group: `banking`,
      icon: `Received`
    },
    {
      type: `Staked`,
      group: `staking`,
      icon: `Staked`
    },
    {
      type: `Restaked`,
      group: `staking`,
      icon: `Restaked`
    },
    {
      type: `Unstaked`,
      group: `staking`,
      icon: `Unstaked`
    },
    {
      type: `Claimed`,
      group: `distribution`,
      icon: `Claimed`
    },
    {
      type: `Claimed with commission`,
      group: `distribution`,
      icon: `Claimed`
    },
    {
      type: `Update withdraw address`,
      group: `distribution`,
      icon: `Claimed`
    },
    {
      type: `Voted xxx`,
      group: `governance`,
      icon: `Voted`
    },
    {
      type: `Deposit`,
      group: `governance`,
      icon: `Deposit`
    },
    {
      type: `Submitted xxx proposal`,
      group: `governance`,
      icon: `Submitted`
    },
    {
      type: `Create`,
      group: `staking`,
      icon: `Create`
    },
    {
      type: `Edit validator`,
      group: `staking`,
      icon: `Edit`
    },
    {
      type: `Unjail`,
      group: `staking`,
      icon: `Unjail`
    }
  ]

  for (let i = 0; i < transactions.length; i++) {
    it(`renders a coloured ${transactions[i].type} transaction icon`, () => {
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
        `/img/icons/activity/${transactions[i].icon}.svg`
      )
    })
  }
})
