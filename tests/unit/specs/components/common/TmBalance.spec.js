import { shallowMount } from "@vue/test-utils"
import TmBalance from "common/TmBalance"

describe(`TmBalance`, () => {
  let wrapper, $store, $apollo

  beforeEach(async () => {
    $store = {
      getters: {
        address: "cosmos1address",
        network: "test-network",
        stakingDenom: "ATOM"
      },
      state: {
        connection: {
          network: "cosmos-hub-mainnet"
        },
        session: {
          experimentalMode: true
        }
      }
    }

    $apollo = {
      queries: {
        overview: {
          loading: false,
          error: false
        },
        rewards: {
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
      overview: {
        totalStake: 3210,
        liquidStake: 1230
      },
      rewards: [
        {
          amount: 1,
          denom: `TOKEN1`
        },
        {
          amount: 2,
          denom: `TOKEN1`
        },
        {
          amount: 1.5,
          denom: `TOKEN1`
        },
        {
          amount: 5,
          denom: `ATOM`
        }
      ]
    })
  })

  it(`show the balance header when signed in`, () => {
    expect(wrapper.element).toMatchSnapshot()
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
    expect(wrapper.text()).toContain("Token")
    expect(wrapper.text()).not.toContain("Available ATOM")
    expect(wrapper.text()).not.toContain("Total Rewards")
  })

  it(`opens send modal`, () => {
    const $refs = {
      SendModal: {
        open: jest.fn()
      }
    }
    wrapper.vm.$refs = $refs
    wrapper.find(".circle-send-button").trigger("click")
    expect($refs.SendModal.open).toHaveBeenCalled()
  })

  it(`opens claim rewards modal`, () => {
    const $refs = {
      ModalWithdrawRewards: {
        open: jest.fn()
      }
    }
    wrapper.vm.$refs = $refs
    wrapper.find("#withdraw-btn").trigger("click")
    expect($refs.ModalWithdrawRewards.open).toHaveBeenCalled()
  })

  it(`disables claim rewards button when no rewards`, () => {
    wrapper.setData({
      rewards: []
    })
    const $refs = {
      ModalWithdrawRewards: {
        open: jest.fn()
      }
    }
    wrapper.vm.$refs = $refs
    wrapper.find("#withdraw-btn").trigger("click")
    expect($refs.ModalWithdrawRewards.open).not.toHaveBeenCalled()
  })

  it(`if no balances are found, then it returns the staking denom`, () => {
    wrapper.setData({
      balances: []
    })
    expect(wrapper.vm.getAllDenoms).toEqual(["ATOM"])
  })

  it(`should show How To Get Tokens tutorial`, () => {
    wrapper.setData({
      showTutorial: false
    })
    wrapper.vm.openTutorial()
    expect(wrapper.vm.showTutorial).toBe(true)
  })

  it(`should hide How To Get Tokens tutorial`, () => {
    wrapper.setData({
      showTutorial: true
    })
    wrapper.vm.hideTutorial()
    expect(wrapper.vm.showTutorial).toBe(false)
  })

  it(`should set the preferred fiat currency in localstorage`, () => {
    const self = {
      selectedFiatCurrency: `USD`
    }
    TmBalance.methods.setPreferredCurrency.call(self)
    expect(localStorage.getItem(`preferredCurrency`, `USD`))
  })

  it(`should calculate the total rewards amount `, () => {
    expect(wrapper.vm.totalRewards).toBe(5)
  })

  it(`should calculate the total rewards amount for each denom when rewards contain multiple denoms`, () => {
    const totalDenomRewards = wrapper.vm.totalRewardsPerDenom[`TOKEN1`]
    expect(totalDenomRewards).toBe(4.5)
  })
})
