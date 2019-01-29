import DelegationModal from "staking/DelegationModal"
import UndelegationModal from "staking/UndelegationModal"
import TmModal from "common/TmModal"
import setup from "../../../helpers/vuex-setup"
import PageValidator from "renderer/components/staking/PageValidator"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

const { stakingParameters } = lcdClientMock.state

const validator = Object.assign({}, lcdClientMock.state.candidates[0], {
  commission: {
    rate: `0.05`,
    max_rate: `0.1`,
    max_change_rate: `0.005`,
    update_time: `1970-01-01T00:00:00Z`
  },
  prev_bonded_shares: `0`,
  voting_power: `10`,
  selfBond: 0.01,
  signing_info: {
    missed_blocks_counter: 2
  }
})
const validatorTo = lcdClientMock.state.candidates[1]

const getterValues = {
  config: { desktop: false },
  delegates: {
    delegates: [validator, validatorTo],
    globalPower: 4200
  },
  delegation: {
    committedDelegates: { [lcdClientMock.validators[0]]: 0 },
    unbondingDelegations: {}
  },
  committedDelegations: {
    [lcdClientMock.validators[0]]: 0
  },
  lastHeader: {
    height: 500
  },
  keybase: `keybase`,
  liquidAtoms: 1337,
  oldBondedAtoms: 100,
  totalAtoms: 1437,
  wallet: { address: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9` },
  connected: true,
  lastPage: null,
  stakingParameters,
  bondDenom: stakingParameters.parameters.bond_denom
}

// TODO refactor tests according to new unit test standard
describe(`PageValidator`, () => {
  let wrapper, store
  const { mount } = setup()

  beforeEach(() => {
    const instance = mount(PageValidator, {
      doBefore: ({ store }) => {
        store.commit(`setCommittedDelegation`, {
          candidateId: lcdClientMock.validators[0],
          value: `123.45678`
        })
        store.commit(`setConnected`, true)
        store.commit(`setDelegates`, [validator, validatorTo])
      },
      mocks: {
        $route: {
          params: { validator: validator.operator_address }
        }
      },
      stubs: {
        "undelegation-modal": true,
        "delegation-modal": true
      },
      getters: {
        bondDenom: () => stakingParameters.parameters.bond_denom,
        wallet: () => ({
          address: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`
        })
      }
    })
    wrapper = instance.wrapper
    store = instance.store

    wrapper.vm.$refs.undelegationModal = { open: () => {} }
    wrapper.vm.$refs.delegationModal = { open: () => {} }
  })

  it(`has the expected html structure`, async () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should return one delegate based on route params`, () => {
    expect(wrapper.vm.validator.operator_address).toEqual(
      lcdClientMock.validators[0]
    )
  })

  it(`shows a default avatar`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should return the self bond based on the validator`, () => {
    const validator = {
      selfBond: 1
    }
    wrapper.setData({ validator })
    expect(wrapper.vm.selfBond).toBe(`100.00%`)

    validator.selfBond = undefined
    wrapper.setData({ validator })
    expect(wrapper.vm.selfBond).toBe(`0.00%`)
  })

  it(`shows an error if the validator couldn't be found`, () => {
    const instance = mount(PageValidator, {
      getters: {
        config: () => ({ desktop: false }),
        delegates: () => ({
          delegates: []
        }),
        bondDenom: () => stakingParameters.parameters.bond_denom,
        wallet: () => ({
          address: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`
        })
      },
      mocks: {
        $route: {
          params: { validator: validator.operator_address }
        }
      },
      stubs: {
        "undelegation-modal": true,
        "delegation-modal": true
      }
    })

    wrapper = instance.wrapper
    store = instance.store

    wrapper.vm.$refs.undelegationModal = { open: () => {} }
    wrapper.vm.$refs.delegationModal = { open: () => {} }

    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`shows the selfBond`, async () => {
    await store.commit(`setSelfBond`, {
      validator: {
        operator_address: lcdClientMock.validators[0],
        delegator_shares: `4242`
      },
      ratio: 0.01
    })
    expect(wrapper.find(`#page-profile__self-bond`).text()).toBe(`1.00%`)
  })

  it(`should show the validator status`, () => {
    expect(wrapper.vm.status).toBe(`This validator is actively validating`)
    // Jailed
    store.state.delegates.delegates = [
      Object.assign({}, validator, {
        revoked: true
      })
    ]
    expect(wrapper.vm.status).toBe(
      `This validator has been jailed and is not currently validating`
    )
    // Is not a validator
    store.state.delegates.delegates = [
      Object.assign({}, validator, {
        voting_power: 0
      })
    ]
    expect(wrapper.vm.status).toBe(
      `This validator does not have enough voting power yet and is inactive`
    )
  })

  // TODO enable when we decide on limits are defined
  // it("switches color indicators", async () => {
  //   store.state.delegates.delegates = [
  //     Object.assign({}, delegate, {
  //       commission: "0"
  //     })
  //   ]
  //   expect(wrapper.find("#validator-profile__commission").classes()).toContain(
  //     "green"
  //   )
  //
  //   store.state.delegates.delegates = [
  //     Object.assign({}, delegate, {
  //       commission: "0.02"
  //     })
  //   ]
  //   expect(wrapper.find("#validator-profile__commission").classes()).toContain(
  //     "yellow"
  //   )
  //
  //   store.state.delegates.delegates = [
  //     Object.assign({}, delegate, {
  //       commission: "1"
  //     })
  //   ]
  //   expect(wrapper.find("#validator-profile__commission").classes()).toContain(
  //     "red"
  //   )
  //
  //   store.state.delegates.globalPower = 1000
  //   store.state.delegates.delegates = [
  //     Object.assign({}, delegate, {
  //       tokens: "1000"
  //     })
  //   ]
  //   expect(wrapper.find("#validator-profile__power").classes()).toContain("red")
  //
  //   store.state.delegates.delegates = [
  //     Object.assign({}, delegate, {
  //       tokens: "10"
  //     })
  //   ]
  //   expect(wrapper.find("#validator-profile__power").classes()).toContain(
  //     "yellow"
  //   )
  //
  //   store.state.delegates.delegates = [
  //     Object.assign({}, delegate, {
  //       tokens: "1"
  //     })
  //   ]
  //   expect(wrapper.find("#validator-profile__power").classes()).toContain(
  //     "green"
  //   )
  // })

  it(`shows a validator as candidate if he has no voting_power`, () => {
    store.state.delegates.delegates = [
      Object.assign({}, validator, {
        voting_power: `0`
      })
    ]
    expect(wrapper.vm.status).toMatchSnapshot()
    // expect(wrapper.find(".page-profile__status").classes()).toContain(
    //   "yellow"
    // )
  })

  it(`shows that a validator is revoked`, () => {
    store.state.delegates.delegates = [
      Object.assign({}, validator, {
        revoked: true
      })
    ]
    expect(wrapper.vm.status).toMatchSnapshot()
    // expect(wrapper.find(".validator-profile__status").classes()).toContain(
    //   "red"
    // )
  })

  it(`disables delegation and undelegation buttons if not connected`, () => {
    expect(
      wrapper.vm.$el.querySelector(`#delegation-btn`).getAttribute(`disabled`)
    ).toBeNull()
    expect(
      wrapper.vm.$el.querySelector(`#undelegation-btn`).getAttribute(`disabled`)
    ).toBeNull()
    store.state.connection.connected = false
    expect(
      wrapper.vm.$el.querySelector(`#delegation-btn`).getAttribute(`disabled`)
    ).not.toBeNull()
    expect(
      wrapper.vm.$el.querySelector(`#undelegation-btn`).getAttribute(`disabled`)
    ).not.toBeNull()
  })
})

describe(`delegationTargetOptions`, () => {
  it(`always shows wallet in the first position`, () => {
    const $store = {
      commit: jest.fn(),
      dispatch: jest.fn()
    }

    const options = PageValidator.methods.delegationTargetOptions.call({
      ...getterValues,
      committedDelegations: {},
      $store,
      $route: {
        params: { validator: validator.operator_address }
      }
    })
    expect(options).toHaveLength(1)
    expect(options[0].address).toEqual(getterValues.wallet.address)

    expect(options).toMatchSnapshot()
  })

  it(`hides displayed validator if bonded`, () => {
    const $store = {
      commit: jest.fn(),
      dispatch: jest.fn()
    }

    const options = PageValidator.methods.delegationTargetOptions.call({
      ...getterValues,
      committedDelegations: {
        [lcdClientMock.validators[0]]: 10
      },
      delegation: {
        committedDelegates: {
          [lcdClientMock.validators[0]]: 10
        },
        unbondingDelegations: {}
      },
      $store,
      $route: {
        params: { validator: validator.operator_address }
      }
    })
    expect(options).toHaveLength(1)
    expect(options).not.toContainEqual(
      expect.objectContaining({ address: validator.operator_address })
    )
    expect(options[0].address).toEqual(getterValues.wallet.address)

    expect(options).toMatchSnapshot()
  })

  it(`shows bonded validators for redelegation options`, () => {
    const $store = {
      commit: jest.fn(),
      dispatch: jest.fn()
    }

    const options = PageValidator.methods.delegationTargetOptions.call({
      ...getterValues,
      committedDelegations: {
        [lcdClientMock.validators[0]]: 10,
        cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au: 5
      },
      delegation: {
        committedDelegates: {
          [lcdClientMock.validators[0]]: 10,
          cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au: 5
        },
        unbondingDelegations: {}
      },
      $store,
      $route: {
        params: { validator: validator.operator_address }
      }
    })

    expect(options).toHaveLength(2)
    expect(options).not.toContainEqual(
      expect.objectContaining({ address: validator.operator_address })
    )
    expect(options[0].address).toEqual(getterValues.wallet.address)
    expect(options).toContainEqual(
      expect.objectContaining({ address: validatorTo.operator_address })
    )

    expect(options).toMatchSnapshot()
  })
})

describe(`onDelegation`, () => {
  let wrapper, store

  beforeEach(() => {
    const { mount } = setup()

    const instance = mount(PageValidator, {
      doBefore: ({ store }) => {
        store.commit(`setCommittedDelegation`, {
          candidateId: lcdClientMock.validators[0],
          value: 100
        })
        store.commit(`setConnected`, true)
        store.commit(`setStakingParameters`, stakingParameters.parameters)
        store.commit(`setDelegates`, [validator, validatorTo])
        store.commit(`updateWalletBalance`, {
          denom: `STAKE`,
          amount: 1337
        })
        store.state.wallet.address = lcdClientMock.addresses[0]
        store.commit(`setStakingParameters`, stakingParameters.parameters)
      },
      mocks: {
        $route: {
          params: { validator: validator.operator_address }
        }
      },
      stubs: {
        "undelegation-modal": true,
        "delegation-modal": true
      },
      getters: {
        bondDenom: () => stakingParameters.parameters.bond_denom,
        wallet: () => ({
          address: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`
        })
      }
    })
    wrapper = instance.wrapper
    store = instance.store

    wrapper.vm.$refs.undelegationModal = { open: () => {} }
    wrapper.vm.$refs.delegationModal = { open: () => {} }
  })

  describe(`make sure we have enough atoms to delegate`, () => {
    it(`is enough`, () => {
      wrapper.find(`#delegation-btn`).trigger(`click`)
      expect(wrapper.contains(DelegationModal)).toEqual(true)
    })

    it(`is not enough`, () => {
      store.commit(`updateWalletBalance`, {
        denom: `STAKE`,
        amount: 0
      })

      wrapper.find(`#delegation-btn`).trigger(`click`)
      expect(wrapper.vm.showCannotModal).toBe(true)
      expect(wrapper.contains(TmModal)).toEqual(true)
      expect(wrapper.text()).toContain(`delegate.`) // ...no atoms to delegate.
      expect(wrapper.vm.$el).toMatchSnapshot()

      wrapper.find(`#no-atoms-modal__btn`).trigger(`click`)
      expect(wrapper.vm.showCannotModal).toBe(false)
      expect(wrapper.contains(TmModal)).toEqual(false)
      expect(wrapper.text()).not.toContain(`delegate.`) // ...no atoms to delegate.
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  })

  describe(`onUnstake`, () => {
    describe(`make sure there are enough atoms to unstake`, () => {
      it(`is enough`, () => {
        store.commit(`setCommittedDelegation`, {
          candidateId: lcdClientMock.validators[0],
          value: 10
        })

        wrapper.find(`#undelegation-btn`).trigger(`click`)
        expect(wrapper.vm.myBond.isGreaterThan(0)).toBe(true)
        expect(wrapper.contains(UndelegationModal)).toEqual(true)
      })

      it(`is not enough`, async () => {
        store.commit(`setCommittedDelegation`, {
          candidateId: lcdClientMock.validators[0],
          value: 0
        })

        wrapper.find(`#undelegation-btn`).trigger(`click`)
        expect(wrapper.vm.showCannotModal).toBe(true)
        expect(wrapper.text()).toContain(`delegated to`)
        expect(wrapper.vm.$el).toMatchSnapshot()

        wrapper.find(`#no-atoms-modal__btn`).trigger(`click`)

        expect(wrapper.text()).not.toContain(`delegated to`)
        expect(wrapper.vm.$el).toMatchSnapshot()
      })
    })
  })
})
