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

  it("should display the portfolio page", async () => {
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

    expect(wrapper.element).toMatchSnapshot()
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
    // always triggers on first update (lastUpdate === 0)
    PagePortfolio.watch.lastHeader.handler.call(self, { height: 5 })
    expect(self.update).toHaveBeenCalledWith(5)

    self.update.mockClear()
    PagePortfolio.watch.lastHeader.handler.call(
      Object.assign({}, self, { lastUpdate: 1 }),
      { height: 5 }
    )
    expect(self.update).not.toHaveBeenCalled()

    self.update.mockClear()
    PagePortfolio.watch.lastHeader.handler.call(self, { height: 100 })
    expect(self.update).toHaveBeenCalledWith(100)

    PagePortfolio.methods.update.call(self, 100)
    expect(self.$store.dispatch).toHaveBeenCalledWith(
      `getRewardsFromMyValidators`
    )
    expect(self.lastUpdate).toBe(100)
  })
})
