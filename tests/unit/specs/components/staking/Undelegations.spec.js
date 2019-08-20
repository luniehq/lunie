import { shallowMount } from "@vue/test-utils"
import Undelegations from "staking/Undelegations"
import validators from "../../store/json/validators.js"
import { flatOrderedTransactionList } from "../../store/json/txs"

describe(`Undelegations`, () => {
  let wrapper, $store
  const getters = {
    lastHeader: { height: `20` },
    yourValidators: validators[0],
    flatOrderedTransactionList: []
  }

  const state = {
    delegation: {
      unbondingDelegations: {},
      loaded: true
    },
    session: { signedIn: true },
    bondDenom: "stake",
    minting: {
      annualProvision: "100"
    }
  }

  beforeEach(() => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      state,
      getters: JSON.parse(JSON.stringify(getters)) // clone so we don't overwrite by accident
    }

    wrapper = shallowMount(Undelegations, {
      mocks: {
        $store
      }
    })
  })

  it(`should show unbonding validators`, () => {
    const time = Date.now() + 10000
    const blockNumber = flatOrderedTransactionList[0].blockNumber
    const address = flatOrderedTransactionList[0].value.validator_address
    const unbondingDelegations = {
      [address]: [
        {
          creation_height: String(blockNumber),
          completion_time: time
        }
      ]
    }

    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      state: Object.assign({}, state, {
        delegation: {
          loaded: true,
          unbondingDelegations
        }
      }),
      getters: Object.assign({}, getters, { flatOrderedTransactionList })
    }

    wrapper = shallowMount(Undelegations, {
      mocks: {
        $store
      }
    })

    expect(wrapper.vm.unbondingTransactions).toMatchSnapshot()
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
