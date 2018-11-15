"use strict"

import Vuelidate from "vuelidate"
import setup from "../../../helpers/vuex-setup"
import ModalDeposit from "renderer/components/governance/ModalDeposit"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

describe(`ModalDeposit`, () => {
  let wrapper, store
  let { mount, localVue } = setup()
  localVue.use(Vuelidate)

  beforeEach(() => {
    const coins = [
      {
        amount: `20`,
        denom: `stake`
      }
    ]
    let instance = mount(ModalDeposit, {
      localVue,
      propsData: {
        proposalId: lcdClientMock.state.proposals[0].proposal_id,
        proposalTitle: lcdClientMock.state.proposals[0].title,
        denom: `stake`
      }
    })
    wrapper = instance.wrapper
    store = instance.store
    store.commit(`setWalletBalances`, coins)
    wrapper.update()
  })

  describe(`component matches snapshot`, () => {
    it(`has the expected html structure`, async () => {
      await wrapper.vm.$nextTick()
      wrapper.update()
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  })

  describe(`default values are set correctly`, () => {
    it(`the 'amount' defaults to 0`, () => {
      expect(wrapper.vm.amount).toEqual(0)
    })
  })

  describe(`enables or disables 'Deposit' button correctly`, () => {
    describe(`disables the 'Deposit' button`, () => {
      it(`with default values`, () => {
        let depositBtn = wrapper.find(`#submit-deposit`)
        expect(depositBtn.html()).toContain(`disabled="disabled"`)
      })

      it(`amount deposited less than the user's balance`, () => {
        wrapper.setData({ amount: 25 })
        let depositBtn = wrapper.find(`#submit-deposit`)
        expect(depositBtn.html()).toContain(`disabled="disabled"`)
      })

      it(`when the user doesn't have the deposited coin`, () => {
        const otherCoins = [
          {
            amount: `20`,
            denom: `otherCoin`
          }
        ]
        store.commit(`setWalletBalances`, otherCoins)
        wrapper.setData({ amount: 25 })
        let depositBtn = wrapper.find(`#submit-deposit`)
        expect(depositBtn.html()).toContain(`disabled="disabled"`)
      })
    })

    describe(`enables the 'Deposit' button`, () => {
      it(`when the user has enough balance to submit a deposit`, () => {
        wrapper.setData({ amount: 15 })
        let submitButton = wrapper.find(`#submit-deposit`)
        expect(submitButton.html()).not.toContain(`disabled="disabled"`)
      })
    })
  })

  describe(`closes modal correctly`, () => {
    it(`X button emits close signal`, () => {
      wrapper.vm.close()
      expect(wrapper.emittedByOrder()).toEqual([
        {
          name: `update:showModalDeposit`,
          args: [false]
        }
      ])
    })
  })

  describe(`Deposit`, () => {
    it(`Deposit button casts a deposit and closes modal`, () => {
      wrapper.setData({ amount: 10 })
      wrapper.vm.onDeposit()

      expect(wrapper.emittedByOrder()).toEqual([
        {
          name: `submitDeposit`,
          args: [
            {
              amount: [
                {
                  amount: `10`,
                  denom: `stake`
                }
              ]
            }
          ]
        },
        {
          name: `update:showModalDeposit`,
          args: [false]
        }
      ])
    })
  })
})
