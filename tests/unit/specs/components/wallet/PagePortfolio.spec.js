import PagePortfolio from "wallet/PagePortfolio"
import { shallowMount } from "@vue/test-utils"

describe(`PagePortfolio`, () => {
  let wrapper, $store

  const getters = {
    connected: true,
    totalRewards: 1000000,
    lastHeader: {
      height: 10
    }
  }

  const state = {
    wallet: {
      balances: [
        {
          denom: `stake`,
          amount: 42
        },
        {
          denom: `photon`,
          amount: 150
        }
      ]
    },
    session: {
      address: "cosmos1234",
      signedIn: true
    },
    delegation: {
      unbondingDelegations: {}
    }
  }

  beforeEach(() => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters,
      state
    }

    wrapper = shallowMount(PagePortfolio, {
      mocks: {
        $store
      }
    })
  })

  it("should display the portfolio page", async () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
