import { shallowMount } from "@vue/test-utils"
import Undelegations from "staking/Undelegations"
import validators from "../../store/json/validators.js"
import { flatOrderedTransactionList } from "../../store/json/txs"

describe(`Undelegations`, () => {
  let wrapper, $store
  const getters = {
    yourValidators: validators[0],
    flatOrderedTransactionList
  }

  const state = {
    session: { signedIn: true }
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
    expect(wrapper.vm.unbondingTransactions).toMatchSnapshot()
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
