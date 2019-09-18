import PageValidator from "staking/PageValidator"
import { shallowMount, createLocalVue } from "@vue/test-utils"
import validators from "../../store/json/validators.js"

const stakingParameters = {
  unbonding_time: `259200000000000`,
  max_validators: 100,
  bond_denom: `STAKE`
}

const validator = validators[1]

const validatorTo = {
  operator_address: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au`,
  description: {
    moniker: `good_greg`
  }
}

const state = {
  session: {
    experimentalMode: true,
    signedIn: true,
    address: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`
  }
}

const getters = {
  committedDelegations: {
    [validator.operator_address]: 0
  },
  lastHeader: {
    height: `500`
  },

  liquidAtoms: 1337,
  connected: true,
  bondDenom: stakingParameters.bond_denom
}

describe(`PageValidator`, () => {
  let wrapper, $store, $apollo
  const localVue = createLocalVue()
  localVue.directive(`tooltip`, () => {})

  beforeEach(() => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      state: {
        session: {
          experimentalMode: true,
          signedIn: true,
          address: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`
        },
        minting: {
          annualProvision: "100"
        },
        distribution: {
          rewards: {
            [validator.operator_address]: 10
          }
        },
        pool: {
          pool: {
            bonded_tokens: 4200
          }
        },
        delegation: { loaded: true },
        delegates: {
          selfBond: {
            [validator.operator_address]: 0.01
          },
          delegates: [validator, validatorTo],
          loaded: true,
          signingInfos: {
            cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw: {
              missed_blocks_counter: 2,
              start_height: 100
            }
          }
        }
      },
      connection: {
        network: "testnet"
      },
      getters: JSON.parse(JSON.stringify(getters)) // clone to be safe we don't overwrite
    }

    $apollo = {
      queries: {
        validator: {
          loading: false,
          error: false
        }
      }
    }
    wrapper = shallowMount(PageValidator, {
      localVue,
      mocks: {
        $store,
        $apollo,
        $route: {
          params: { validator: validator.operator_address }
        }
      },
      stubs: [`router-link`]
    })
    wrapper.setData({ validator })
  })

  describe(`shows a validator profile information`, () => {
    it(`if user has signed in`, () => {
      expect(wrapper.element).toMatchSnapshot()
    })

    it(`if user hasn't signed in`, () => {
      $store.state.session.signedIn = false

      expect(wrapper.element).toMatchSnapshot()
    })

    it(`should return one delegate based on route params`, () => {
      expect(wrapper.vm.validator.operator_address).toEqual(
        validator.operator_address
      )
    })

    it(`should return the self bond based on the validator`, () => {
      wrapper.setData({ validator })
      expect(wrapper.vm.selfBond).toBe(`1.00%`)

      wrapper.vm.delegates.selfBond[validator.operator_address] = `0`
      wrapper.setData({ validator })
      expect(wrapper.vm.selfBond).toBe(`0.00%`)
    })

    it(`shows an error if the validator couldn't be found`, () => {
      $store.state.delegates.delegates = []

      expect(wrapper.exists(`tm-data-error-stub`)).toBe(true)
    })

    it(`shows invalid validator address page if invalid validator address used`, () => {
      $store.state.delegates.delegates = []

      expect(wrapper.exists(`tm-data-msg`)).toBe(true)
    })

    it(`shows the selfBond`, () => {
      expect(wrapper.find(`#page-profile__self-bond`).text()).toBe(
        `1.00% / 10,000`
      )
    })

    it(`should show the validator status`, () => {
      expect(wrapper.vm.status).toBe(`Active`)

      wrapper.setData({ validator: validators[3] })
      expect(wrapper.vm.status).toBe(`Jailed`)
      // Is not a validator
      wrapper.setData({ validator: validators[4] })
      expect(wrapper.vm.status).toBe(`Inactive`)
    })

    it(`shows a validator as an inactive candidate if he has no voting_power`, () => {
      $store.state.delegates.delegates = [
        Object.assign({}, validator, {
          status: 0
        })
      ]
      expect(wrapper.vm.status).toMatchSnapshot()
    })

    it(`shows that a validator is jailed`, () => {
      $store.state.delegates.delegates = [
        Object.assign({}, validator, {
          jailed: true
        })
      ]
      expect(wrapper.vm.status).toMatchSnapshot()
    })

    it(`shows empty website url`, () => {
      const emtpyWebSiteValidator = Object.assign({}, validator)
      emtpyWebSiteValidator.website = ""
      wrapper.setData({ validator: emtpyWebSiteValidator })
      expect(wrapper.element).toMatchSnapshot()
    })

    it(`shows https website url`, () => {
      wrapper.setData({ validator })
      expect(wrapper.vm.website).toBe(`https://www.greg.com`)
    })

    it(`shows http website url`, () => {
      const httpWebSiteValidator = Object.assign({}, validator)
      httpWebSiteValidator.website = "http://www.monty.ca"
      wrapper.setData({ validator: httpWebSiteValidator })
      expect(wrapper.element).toMatchSnapshot()
    })

    describe(`errors`, () => {
      it(`signing info is missing`, () => {
        $store.state.delegates.delegates = [
          Object.assign({}, validator, {
            signing_info: undefined
          })
        ]
        // still shows the validator without crashing
        expect(wrapper.element).toMatchSnapshot()
      })
    })
  })

  describe(`myDelegation`, () => {
    it(`when user has delegations`, () => {
      const bondDenom = `STAKE`
      const myBond = 10
      const delegationString = PageValidator.computed.myDelegation.call({
        bondDenom,
        myBond
      })
      expect(delegationString).toBe(`10 STAKE`)
    })

    it(`when user doesn't have any delegations`, () => {
      const bondDenom = `STAKE`
      const myBond = 0
      const delegationString = PageValidator.computed.myDelegation.call({
        bondDenom,
        myBond
      })
      expect(delegationString).toBe(null)
    })
  })

  describe(`rewards`, () => {
    let bondDenom, validator, session, lastHeader

    beforeEach(() => {
      bondDenom = `STAKE`
      validator = { operator_address: `cosmos1address` }
      session = { signedIn: true }
      lastHeader = { height: `20` }
    })
    it(`gets rewards from validator if it has some`, () => {
      const distribution = {
        rewards: {
          [validator.operator_address]: {
            [bondDenom]: 100000000
          }
        }
      }
      const rewardsValue = PageValidator.computed.rewards.call({
        session,
        bondDenom,
        distribution,
        validator,
        lastHeader
      })
      expect(rewardsValue).toBe(100000000)
    })

    it(`when validator rewards are 0`, () => {
      const distribution = {
        rewards: {
          [validator.operator_address]: {
            [bondDenom]: 0
          }
        }
      }

      const rewardsValue = PageValidator.computed.rewards.call({
        session,
        bondDenom,
        distribution,
        validator,
        lastHeader
      })
      expect(rewardsValue).toBe(0)
    })

    it(`when user doesn't have any delegations`, () => {
      const distribution = { rewards: {} }
      const rewardsValue = PageValidator.computed.rewards.call({
        session,
        bondDenom,
        distribution,
        validator,
        lastHeader
      })
      expect(rewardsValue).toBe(0)
    })

    it(`when user is not signed in`, () => {
      const distribution = { rewards: {} }
      const rewardsValue = PageValidator.computed.rewards.call({
        session: {
          signedIn: false
        },
        bondDenom,
        distribution,
        validator,
        lastHeader
      })
      expect(rewardsValue).toBe(null)
    })
  })

  it(`should only call user rewards if bond is more then 0`, () => {
    const $store = { dispatch: jest.fn() }
    const myBond = 1
    const $route = { params: { validator: `cosmos1address` } }
    PageValidator.watch[`myBond`].handler.call({ $store, $route }, myBond)
    expect($store.dispatch).toHaveBeenCalledWith(
      `getRewardsFromValidator`,
      $route.params.validator
    )
  })

  it(`shouldn't call user rewards if bond is 0`, () => {
    const $store = { dispatch: jest.fn() }
    const myBond = 0
    const $route = { params: { validator: `cosmos1address` } }
    PageValidator.watch[`myBond`].handler.call({ $store, $route }, myBond)
    expect($store.dispatch).not.toHaveBeenCalledWith(
      `getRewardsFromValidator`,
      $route.params.validator
    )
  })

  describe(`update rewards on new blocks`, () => {
    describe(`shouldn't update`, () => {
      it(`if user is not signed in `, () => {
        const $store = { dispatch: jest.fn() }
        const session = { signedIn: false }
        const $route = {
          params: { validator: `cosmos1address` },
          name: `validator`
        }
        const myBond = 1
        const newHeader = { height: `20` }
        const delegation = { loaded: true }
        PageValidator.watch.lastHeader.handler.call(
          { session, $store, $route, myBond, delegation },
          newHeader
        )
        expect($store.dispatch).not.toHaveBeenCalledWith(
          `getRewardsFromValidator`,
          $route.params.validator
        )
      })

      it(`if hasn't waited for 20 blocks `, () => {
        const $store = { dispatch: jest.fn() }
        const session = { signedIn: true }
        const $route = {
          params: { validator: `cosmos1address` },
          name: `validator`
        }
        const myBond = 1
        const newHeader = { height: `30` }
        const delegation = { loaded: true }
        PageValidator.watch.lastHeader.handler.call(
          { session, $store, $route, myBond, delegation },
          newHeader
        )
        expect($store.dispatch).not.toHaveBeenCalledWith(
          `getRewardsFromValidator`,
          $route.params.validator
        )
      })

      it(`if user is not watching page validator`, () => {
        const $store = { dispatch: jest.fn() }
        const session = { signedIn: true }
        const $route = {
          params: { validator: `cosmos1address` },
          name: `my-delegations`
        }
        const myBond = 1
        const newHeader = { height: `20` }
        const delegation = { loaded: true }
        PageValidator.watch.lastHeader.handler.call(
          { session, $store, $route, myBond, delegation },
          newHeader
        )
        expect($store.dispatch).not.toHaveBeenCalledWith(
          `getRewardsFromValidator`,
          $route.params.validator
        )
      })

      it(`if user doesn't have any delegations `, () => {
        const $store = { dispatch: jest.fn() }
        const session = { signedIn: true }
        const $route = {
          params: { validator: `cosmos1address` },
          name: `validator`
        }
        const myBond = 0
        const newHeader = { height: `30` }
        const delegation = { loaded: true }
        PageValidator.watch.lastHeader.handler.call(
          { session, $store, $route, myBond, delegation },
          newHeader
        )
        expect($store.dispatch).not.toHaveBeenCalledWith(
          `getRewardsFromValidator`,
          $route.params.validator
        )
      })
    })

    describe(`should update rewards `, () => {
      it(
        `if waited for 20 blocks, ` +
          `user has signed in, ` +
          `has delegations and is watching the validator page`,
        () => {
          const $store = { dispatch: jest.fn() }
          const session = { signedIn: true }
          const $route = {
            params: { validator: `cosmos1address` },
            name: `validator`
          }
          const myBond = 1
          const newHeader = { height: `20` }
          const delegation = { loaded: true }
          PageValidator.watch.lastHeader.handler.call(
            { session, $store, $route, myBond, delegation },
            newHeader
          )
          expect($store.dispatch).toHaveBeenCalledWith(
            `getRewardsFromValidator`,
            $route.params.validator
          )
        }
      )
    })
  })
})

describe(`delegationTargetOptions`, () => {
  it(`always shows wallet in the first position`, () => {
    const $store = {
      commit: jest.fn(),
      dispatch: jest.fn()
    }

    const options = PageValidator.methods.delegationTargetOptions.call({
      ...getters,
      ...state,
      committedDelegations: {},
      $store,
      $route: {
        params: { validator: validator.operator_address }
      }
    })
    expect(options).toHaveLength(1)
    expect(options[0].address).toEqual(state.session.address)

    expect(options).toMatchSnapshot()
  })

  it(`hides displayed validator if bonded`, () => {
    const $store = {
      commit: jest.fn(),
      dispatch: jest.fn()
    }

    const options = PageValidator.methods.delegationTargetOptions({
      ...getters,
      ...state,
      committedDelegations: {
        [validator.operator_address]: 10
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
    expect(options[0].address).toEqual(state.session.address)

    expect(options).toMatchSnapshot()
  })

  it(`shows bonded validators for redelegation options`, () => {
    const curValidator = validators[0]

    const $store = {
      commit: jest.fn(),
      dispatch: jest.fn()
    }

    const state = {
      delegates: {
        selfBond: {
          [curValidator.operator_address]: 0.01
        },
        delegates: [curValidator, validatorTo],
        loaded: true,
        signingInfos: {
          cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw: {
            missed_blocks_counter: 2,
            start_height: 500
          }
        }
      },
      session: {
        experimentalMode: true,
        signedIn: true,
        address: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`
      }
    }

    const options = PageValidator.methods.delegationTargetOptions.call({
      ...getters,
      ...state,
      committedDelegations: {
        [curValidator.operator_address]: 10,
        cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au: 5
      },
      $store,
      $route: {
        params: { validator: curValidator.operator_address }
      }
    })

    expect(options).toHaveLength(2)
    expect(options).not.toContainEqual(
      expect.objectContaining({ address: curValidator.operator_address })
    )
    expect(options[0].address).toEqual(state.session.address)
    expect(options).toContainEqual(
      expect.objectContaining({ address: validatorTo.operator_address })
    )

    expect(options).toMatchSnapshot()
  })

  describe(`Staking functions`, () => {
    describe(`onDelegation`, () => {
      it(`should open delegation modal`, () => {
        const self = {
          $refs: {
            delegationModal: {
              open: jest.fn()
            }
          }
        }
        PageValidator.methods.onDelegation.call(self)
        expect(self.$refs.delegationModal.open).toHaveBeenCalled()
      })
    })

    describe(`onUndelegation`, () => {
      it(`should open undelegation modal`, () => {
        const self = {
          $refs: {
            undelegationModal: {
              open: jest.fn()
            }
          }
        }
        PageValidator.methods.onUndelegation.call(self)
        expect(self.$refs.undelegationModal.open).toHaveBeenCalled()
      })
    })
  })
})
