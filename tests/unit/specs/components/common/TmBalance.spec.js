import { shallowMount } from "@vue/test-utils"
import TmBalance from "common/TmBalance"

describe(`TmBalance`, () => {
  let wrapper, $store

  beforeEach(async () => {
    $store = {
      getters: {
        address: "cosmos1address",
        network: "test-network"
      }
    }

    wrapper = shallowMount(TmBalance, {
      mocks: {
        $store
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
})
