import { shallowMount, createLocalVue } from "@vue/test-utils"
import DelegationsOverview from "staking/DelegationsOverview"
import validators from "../../store/json/validators.js"
import Vuex from "vuex"

describe(`DelegationsOverview`, () => {
  const localVue = createLocalVue()
  localVue.use(Vuex)

  let wrapper, $store, $apollo, delegations

  const getters = {
    committedDelegations: {
      [validators[0].operator_address]: validators[0]
    },
    address: "cosmos1",
    network: "testnet"
  }

  delegations = [
    {
      validator: validators[0],
      delegatorAddress: `cosmos1`,
      amount: 10
    },
    {
      validator: validators[1],
      delegatorAddress: `cosmos1`,
      amount: 12
    },
    {
      validator: validators[2],
      delegatorAddress: `cosmos1`,
      amount: 11
    }
  ]

  beforeEach(() => {
    $store = {
      getters,
      state: {
        connection: {
          network: "testnet"
        },
        delegations
      },
      address: "cosmos1",
      network: "testnet"
    }

    $apollo = {
      queries: {
        delegations: {
          loading: false,
          error: false
        }
      }
    }

    wrapper = shallowMount(DelegationsOverview, {
      mocks: {
        $store,
        $apollo
      },
      stubs: [`router-link`]
    })

    wrapper.setData({
      delegations
    })
  })

  it(`shows an overview over all delegations of the user`, async () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`shows a sentiment of dissatisfaction when you have no such delegations`, async () => {
    wrapper.setData({ delegations: [] })
    expect(wrapper.element).toMatchSnapshot()
  })
})
