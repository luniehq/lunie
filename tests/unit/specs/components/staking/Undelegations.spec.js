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
      getters
    }

    wrapper = shallowMount(Undelegations, {
      mocks: {
        $store
      }
    })
  })

  it(`should show unbonding validators`, () => {
    expect(wrapper.vm.unbondingTransactions).toMatchSnapshot()
    expect(wrapper.element).toMatchSnapshot()
  })
})
