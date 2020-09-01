import { shallowMount } from "@vue/test-utils"
import TmBalance from "common/TmBalance"

describe(`TmBalance`, () => {
  let wrapper, $store, $apollo

  beforeEach(async () => {
    $store = {
      dispatch: jest.fn(),
      getters: {
        address: "cosmos1address",
        network: "test-network",
        stakingDenom: "MUON",
        networks: [
          {
            id: "test-network",
            testnet: false,
          },
        ],
        currentNetwork: {
          network_type: "cosmos",
        },
      },
      state: {
        connection: {
          network: "cosmos-hub-mainnet",
        },
        session: {
          experimentalMode: true,
        },
      },
    }

    $apollo = {
      queries: {
        balances: {
          loading: false,
          error: false,
        },
        rewards: {
          loading: false,
          error: false,
        },
      },
    }

    wrapper = shallowMount(TmBalance, {
      mocks: {
        $store,
        $apollo,
      },
    })
    wrapper.setData({
      balances: [
        {
          type: "STAKE",
          denom: "MUON",
          available: "80.780405",
          total: "100.780405",
          fiatValue: {
            amount: "10",
            denom: "USD",
            symbol: "$",
          },
        },
        {
          type: "CURRENCY",
          denom: "MUON_2",
          available: "17.780405",
          total: "20.780405",
          fiatValue: {
            amount: "40",
            denom: "USD",
            symbol: "$",
          },
        },
      ],
      rewards: [
        {
          amount: 1,
          denom: `TOKEN1`,
        },
        {
          amount: 2,
          denom: `TOKEN1`,
        },
        {
          amount: 1.5,
          denom: `TOKEN1`,
        },
        {
          amount: 5,
          denom: `MUON`,
        },
      ],
    })
  })

  it(`show the balance header when signed in`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`do not show available atoms when the user has none in the first place`, () => {
    wrapper.setData({
      balances: [
        {
          type: "STAKE",
          denom: "MUON",
          available: "0",
          total: "0",
          fiatValue: {
            amount: "0",
            denom: "USD",
            symbol: "$",
          },
        },
      ],
    })
    expect(wrapper.element).toMatchSnapshot()
    expect(wrapper.text()).not.toContain("Available ATOM")
    expect(wrapper.text()).not.toContain("Total Rewards")
  })

  it(`opens claim rewards modal`, () => {
    const $refs = {
      ModalWithdrawRewards: {
        open: jest.fn(),
      },
    }
    wrapper.vm.$refs = $refs
    wrapper.find("#withdraw-btn").trigger("click")
    expect($refs.ModalWithdrawRewards.open).toHaveBeenCalled()
  })

  it(`disables claim rewards button when no rewards`, () => {
    wrapper.setData({
      rewards: [],
    })
    const $refs = {
      ModalWithdrawRewards: {
        open: jest.fn(),
      },
    }
    wrapper.vm.$refs = $refs
    wrapper.find("#withdraw-btn").trigger("click")
    expect($refs.ModalWithdrawRewards.open).not.toHaveBeenCalled()
  })

  it(`if no balances are found, then it returns the staking denom`, () => {
    wrapper.setData({
      balances: [],
    })
    expect(wrapper.vm.getAllDenoms).toEqual(["MUON"])
  })

  it(`should show How To Get Tokens tutorial`, () => {
    wrapper.setData({
      showTutorial: false,
    })
    wrapper.vm.openTutorial()
    expect(wrapper.vm.showTutorial).toBe(true)
  })

  it(`should hide How To Get Tokens tutorial`, () => {
    wrapper.setData({
      showTutorial: true,
    })
    wrapper.vm.hideTutorial()
    expect(wrapper.vm.showTutorial).toBe(false)
  })

  it(`should set the preferred fiat currency in store`, () => {
    wrapper.setData({
      preferredCurrency: `USD`,
    })
    wrapper.vm.setPreferredCurrency()
    expect($store.dispatch).toHaveBeenCalledWith(`setPreferredCurrency`, `USD`)
  })

  it(`should calculate the total rewards amount `, () => {
    expect(wrapper.vm.totalRewards).toBe(5)
  })

  it(`should calculate the total rewards amount for each denom when rewards contain multiple denoms`, () => {
    const totalDenomRewards = wrapper.vm.totalRewardsPerDenom[`MUON`]
    expect(totalDenomRewards).toBe(5)
  })
})
