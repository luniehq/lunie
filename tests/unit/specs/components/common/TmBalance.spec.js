import { shallowMount } from "@vue/test-utils"
import TmBalance from "common/TmBalance"

describe(`TmBalance`, () => {
  let wrapper, $store, $apollo

  beforeEach(async () => {
    $store = {
      getters: {
        address: "cosmos1address",
        network: "test-network"
      }
    }

    $apollo = {
      queries: {
        overview: {
          loading: false,
          error: false
        }
      }
    }

    wrapper = shallowMount(TmBalance, {
      mocks: {
        $store,
        $apollo
      }
    })
    wrapper.setData({
      stakingDenom: "ATOM",
      overview: {
        totalStake: 3210,
        liquidStake: 1230,
        totalRewards: 1000.45
      }
    })
  })

  it(`show the balance header when signed in`, () => {
    expect(wrapper.element).toMatchSnapshot()
    expect(wrapper.text()).toMatch(/Total ATOM.*3,210/s)
    expect(wrapper.text()).toMatch(/Available ATOM.*1,230/s)
    expect(wrapper.text()).toMatch(/Total Rewards.*1,000.45/s)
    expect(wrapper.text()).toContain("Total ATOM")
    expect(wrapper.text()).toContain("Total ATOM")
    expect(wrapper.text()).toContain("Total ATOM")
  })

  it(`do not show available atoms when the user has none in the first place`, () => {
    // This *should* set overview to an empty Object, but the call is ignored?
    // Setting it to false has the desired effect.
    wrapper.setData({
      overview: {
        totalStake: 0,
        liquidStake: 0,
        totalRewards: 0
      }
    })
    expect(wrapper.element).toMatchSnapshot()
    expect(wrapper.text()).toContain("Total ATOM")
    expect(wrapper.text()).not.toContain("Available ATOM")
    expect(wrapper.text()).not.toContain("Total Rewards")
  })

  it(`opens send modal`, () => {
    const $refs = { SendModal: { open: jest.fn() } }
    wrapper.vm.$refs = $refs
    wrapper.find(".send-button").trigger("click")
    expect($refs.SendModal.open).toHaveBeenCalled()
  })

  it(`opens claim rewards modal`, () => {
    const $refs = { ModalWithdrawRewards: { open: jest.fn() } }
    wrapper.vm.$refs = $refs
    wrapper.find("#withdraw-btn").trigger("click")
    expect($refs.ModalWithdrawRewards.open).toHaveBeenCalled()
  })

  it(`disables claim rewards button when no rewards`, () => {
    wrapper.setData({
      overview: {
        totalRewards: 0
      }
    })
    const $refs = { ModalWithdrawRewards: { open: jest.fn() } }
    wrapper.vm.$refs = $refs
    wrapper.find("#withdraw-btn").trigger("click")
    expect($refs.ModalWithdrawRewards.open).not.toHaveBeenCalled()
  })

  it(`should return the balances for the balances dropdown`, () => {
    wrapper.setData({
      balances: [
        {
          amount: 1,
          denom: `TOKEN1`
        },
        {
          amount: 2,
          denom: `TOKEN2`
        }
      ]
    })
    expect(wrapper.vm.concatBalances).toEqual([
      { value: ``, key: `TOKEN1 1` },
      { value: ``, key: `TOKEN2 2` }
    ])
  })

  it(`if no balances are found, then it returns the staking denom`, () => {
    wrapper.setData({
      balances: []
    })
    expect(wrapper.vm.getAllDenoms).toEqual(["ATOM"])
  })

  it(`should return the fiat currencies for the currencies selector`, () => {
    expect(wrapper.vm.fiatCurrencies).toEqual([
      { key: `EUR`, value: `EUR` },
      { key: `USD`, value: `USD` },
      { key: `GBP`, value: `GBP` },
      { key: `CHF`, value: `CHF` },
      { key: `JPY`, value: `JPY` }
    ])
  })

  it(`should return balances concatanating denoms and fiat values`, () => {
    wrapper.setData({
      balances: [
        {
          amount: 1,
          denom: `TOKEN1`,
          fiatValue: 1.52
        },
        {
          amount: 2,
          denom: `TOKEN2`,
          fiatValue: 3.04
        }
      ]
    })
    expect(wrapper.vm.convertedBalances).toEqual([
      { key: `TOKEN1 1.52`, value: `` },
      { key: `TOKEN2 3.04`, value: `` }
    ])
  })
})
