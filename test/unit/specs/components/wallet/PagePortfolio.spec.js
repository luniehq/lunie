import PagePortfolio from "src/components/wallet/PagePortfolio"
import { shallowMount } from "@vue/test-utils"

describe(`PagePortfolio`, () => {
  let wrapper, $store

  const getters = {
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
    },
    connected: true,
    lastHeader: {
      height: 10
    },
    bondDenom: "stake",
    totalRewards: 1000000
  }

  beforeEach(() => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters
    }

    wrapper = shallowMount(PagePortfolio, {
      mocks: {
        $store
      }
    })
  })

  it("should display the portfolio page", () => {
    expect(wrapper.element).toMatchSnapshot()
  })
})
