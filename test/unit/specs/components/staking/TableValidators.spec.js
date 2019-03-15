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
      [validators[0].description.identity]: {
        // TODO
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
})
