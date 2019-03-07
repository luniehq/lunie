import { shallowMount } from "@vue/test-utils"
import TableValidators from "renderer/components/staking/TableValidators"
import validators from "../../store/json/validators.js"

describe(`TableValidators`, () => {
  let wrapper, $store

  const getters = {
    delegation: {
      loaded: true
    },
    committedDelegations: {
      [validators[0].operator_address]: 0
    },
    session: {
      address: `address1234`
    },
    liquidAtoms: 42,
    connected: true,
    bondDenom: `stake`,
    keybase: {
      [validators[0].description.identity]: {}
    }
  }

  beforeEach(() => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: JSON.parse(JSON.stringify(getters)) // clone so we don't overwrite by accident
    }

    wrapper = shallowMount(TableValidators, {
      mocks: {
        $store
      },
      propsData: {
        validators
      }
    })
  })

  it(`has the expected html structure`, async () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should sort the delegates by selected property`, () => {
    wrapper.vm.sort.property = `operator_address`
    wrapper.vm.sort.order = `desc`

    expect(
      wrapper.vm.sortedEnrichedDelegates.map(x => x.operator_address)
    ).toEqual(validators.map(x => x.operator_address))

    wrapper.vm.sort.property = `operator_address`
    wrapper.vm.sort.order = `asc`

    expect(
      wrapper.vm.sortedEnrichedDelegates.map(x => x.operator_address)
    ).toEqual(validators.map(x => x.operator_address).reverse())
  })

  it(`should disallow delegation if user can't delegate`, () => {
    let res = TableValidators.computed.userCanDelegate.call({
      liquidAtoms: 0,
      delegation: {
        loaded: true
      }
    })
    expect(res).toBe(false)

    res = TableValidators.computed.userCanDelegate.call({
      liquidAtoms: 1,
      delegation: {
        loaded: true
      }
    })
    expect(res).toBe(true)

    res = TableValidators.computed.userCanDelegate.call({
      liquidAtoms: 1,
      delegation: {
        loaded: false
      }
    })
    expect(res).toBe(false)
  })

  it(`queries delegations on signin`, () => {
    const session = {
      address: `cosmos1address`
    }
    const $store = {
      dispatch: jest.fn()
    }
    TableValidators.watch.address.call({
      $store, session
    })
    expect($store.dispatch).toHaveBeenCalledWith(`updateDelegates`)
  })

  it(`doesn't query delegations if not signed in`, () => {
    const session = {
      address: undefined
    }
    const $store = {
      dispatch: jest.fn()
    }
    TableValidators.watch.address.call({
      $store, session
    })
    expect($store.dispatch).not.toHaveBeenCalledWith(`updateDelegates`)
  })

  describe(`update validators rewards every block`, () => {
    it(`updates if there are existing validators`, () => {
      const validators = [
        {
          operator_address: `cosmosvaloper1address`,
          pub_key: `cosmosvalpub1234`,
          revoked: false,
          tokens: `14`,
          delegator_shares: `14`,
          description: {
            website: `www.fede.cl`,
            details: `Fede's validator`,
            moniker: `fedekunze`,
            country: `Chile`
          },
          status: 2,
          bond_height: `0`,
          bond_intra_tx_counter: 6,
          proposer_reward_pool: null,
          commission: {
            rate: `0`,
            max_rate: `0`,
            max_change_rate: `0`,
            update_time: `1970-01-01T00:00:00Z`
          },
          prev_bonded_shares: `0`
        }
      ]
      const session = {
        signedIn: true
      }
      const $store = {
        dispatch: jest.fn()
      }
      TableValidators.watch.validators.call({
        $store, session
      }, validators)
      expect($store.dispatch).toHaveBeenCalledWith(
        `getRewardsFromAllValidators`,
        validators
      )
    })

    describe(`doesn't update rewards`, () => {
      it(`if user hasn't signed in`, () => {
        const validators = [
          {
            operator_address: `cosmosvaloper1address`,
            pub_key: `cosmosvalpub1234`,
            revoked: false,
            tokens: `14`,
            delegator_shares: `14`,
            description: {
              website: `www.fede.cl`,
              details: `Fede's validator`,
              moniker: `fedekunze`,
              country: `Chile`
            },
            status: 2,
            bond_height: `0`,
            bond_intra_tx_counter: 6,
            proposer_reward_pool: null,
            commission: {
              rate: `0`,
              max_rate: `0`,
              max_change_rate: `0`,
              update_time: `1970-01-01T00:00:00Z`
            },
            prev_bonded_shares: `0`
          }
        ]
        const session = {
          signedIn: false
        }
        const $store = {
          dispatch: jest.fn()
        }
        TableValidators.watch.validators.call({
          $store, session
        }, validators)
        expect($store.dispatch).not.toHaveBeenCalledWith(
          `getRewardsFromAllValidators`,
          validators
        )
      })

      it(`if validator set is empty`, () => {
        const validators = []
        const session = {
          signedIn: true
        }
        const $store = {
          dispatch: jest.fn()
        }
        TableValidators.watch.validators.call({
          $store, session
        }, validators)
        expect($store.dispatch).not.toHaveBeenCalledWith(
          `getRewardsFromAllValidators`,
          validators
        )
      })

      it(`if validator set is undefined`, () => {
        const validators = undefined
        const session = {
          signedIn: true
        }
        const $store = {
          dispatch: jest.fn()
        }
        TableValidators.watch.validators.call({
          $store, session
        }, validators)
        expect($store.dispatch).not.toHaveBeenCalledWith(
          `getRewardsFromAllValidators`,
          validators
        )
      })
    })
  })
})
