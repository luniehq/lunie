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

  it("should display the portfolio page", () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it("should trigger updates on every 10th block", () => {
    const self = {
      lastUpdate: 0,
      session: {
        signedIn: true
      },
      update: jest.fn(),
      $store: {
        dispatch: jest.fn()
      }
    }
    PagePortfolio.watch.lastHeader.handler.call(self, { height: 5 })
    expect(self.update).not.toHaveBeenCalled()

    PagePortfolio.watch.lastHeader.handler.call(self, { height: 100 })
    expect(self.update).toHaveBeenCalledWith(100)

    PagePortfolio.methods.update.call(self, 100)
    expect(self.$store.dispatch).toHaveBeenCalledWith(
      `getRewardsFromMyValidators`
    )
    expect(self.lastUpdate).toBe(100)
  })
})
