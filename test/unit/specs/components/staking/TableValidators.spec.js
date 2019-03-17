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
      [validators[2].operator_address]: 10
    },
    session: {
      address: `address1234`
    },
    liquidAtoms: 42,
    connected: true,
    bondDenom: `stake`,
    keybase: {
      [validators[0].description.identity]: {
        // TODO
      }
    },
    pool: {
      pool: {
        bonded_tokens: 500001,
      }
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
      propsData: { validators }
    })
  })

  it(`has the expected html structure`, async () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should sort the delegates by selected property`, () => {
    wrapper.vm.sort.property = `operator_address`
    wrapper.vm.sort.order = `desc`

    expect(
      wrapper.vm.sortedEnrichedValidators.map(x => x.operator_address)
    ).toEqual(validators.map(x => x.operator_address))

    wrapper.vm.sort.property = `operator_address`
    wrapper.vm.sort.order = `asc`

    expect(
      wrapper.vm.sortedEnrichedValidators.map(x => x.operator_address)
    ).toEqual(validators.map(x => x.operator_address).reverse())
  })

  it(`queries delegations on signin`, () => {
    const session = { address: `cosmos1address` }
    const $store = { dispatch: jest.fn() }
    TableValidators.watch.address.call({ $store, session })
    expect($store.dispatch).toHaveBeenCalledWith(`updateDelegates`)
  })

  it(`doesn't query delegations if not signed in`, () => {
    const session = { address: undefined }
    const $store = { dispatch: jest.fn() }
    TableValidators.watch.address.call({ $store, session })
    expect($store.dispatch).not.toHaveBeenCalledWith(`updateDelegates`)
  })

  xit(`updates if there are existing validators`, () => {
    const session = { signedIn: true }
    $store = {
      dispatch: jest.fn(),
      getters: {
        committedDelegations: {
          [validators[2].operator_address]: 10
        }
      }
    }
    TableValidators.watch.validators.call({ $store, session }, validators)
    expect($store.dispatch).toHaveBeenCalledWith(
      `getRewardsFromAllValidators`,
      validators[2]
    )
  })

  it(`doesn't update rewards if user hasn't signed in`, () => {
    const validators = []
    const session = { signedIn: false }
    TableValidators.watch.validators.call({ $store, session }, validators)
    expect($store.dispatch).not.toHaveBeenCalledWith(
      `getRewardsFromAllValidators`
    )
  })

  it(`doesn't update rewards if validator set is empty`, () => {
    const validators = []
    const session = { signedIn: true }
    TableValidators.watch.validators.call({ $store, session }, validators)
    expect($store.dispatch).not.toHaveBeenCalledWith(
      `getRewardsFromAllValidators`
    )
  })

  it(`doesn't update rewards if validator set is undefined`, () => {
    const validators = undefined
    const session = { signedIn: true }
    TableValidators.watch.validators.call({ $store, session }, validators)
    expect($store.dispatch).not.toHaveBeenCalledWith(
      `getRewardsFromAllValidators`
    )
  })
})
