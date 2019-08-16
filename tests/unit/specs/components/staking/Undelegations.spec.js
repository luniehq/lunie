import { shallowMount } from "@vue/test-utils"
import Undelegations from "staking/Undelegations"
import validators from "../../store/json/validators.js"
import { stakingTxs } from "../../store/json/txs"

describe(`Undelegations`, () => {
  let wrapper, $store
  const getters = {
    transactions: {
      staking: []
    },
    delegation: {
      unbondingDelegations: {},
      loaded: true
    },
    session: { signedIn: true },
    lastHeader: { height: `20` },
    yourValidators: validators,
    bondDenom: "stake"
  }

  beforeEach(() => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      state: {
        minting: {
          annualProvision: "100"
        }
      },
      getters: JSON.parse(JSON.stringify(getters)) // clone so we don't overwrite by accident
    }

    wrapper = shallowMount(Undelegations, {
      mocks: {
        $store
      }
    })
  })

  it(`should show unbonding validators`, () => {
    const time = new Date(Date.now()).toISOString()
    const height = stakingTxs[3].height
    const address = stakingTxs[3].tx.value.msg[0].value.validator_address
    const unbondingDelegations = {
      [address]: [
        {
          creation_height: height,
          completion_time: time
        }
      ]
    }

    wrapper.vm.delegation.unbondingDelegations = unbondingDelegations
    wrapper.vm.transactions.staking = [stakingTxs[3]]

    expect(wrapper.vm.unbondingTransactions).toMatchSnapshot()
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
