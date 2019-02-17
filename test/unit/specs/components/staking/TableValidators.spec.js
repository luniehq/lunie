import setup from "../../../helpers/vuex-setup"
import TableValidators from "renderer/components/staking/TableValidators"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

const { stakingParameters } = lcdClientMock.state

describe(`TableValidators`, () => {
  let wrapper, store
  const { mount } = setup()

  beforeEach(() => {
    const instance = mount(TableValidators, {
      doBefore: ({ store }) => {
        store.commit(`setConnected`, true)
        store.commit(`updateWalletBalance`, {
          denom: `atom`,
          amount: 1337
        })
      },
      propsData: { validators: lcdClientMock.candidates }
    })
    wrapper = instance.wrapper
    store = instance.store
    store.state.session.address = `address1234`
    store.commit(`updateWalletBalance`, {
      denom: `atom`,
      amount: 1337
    })
    store.commit(`setStakingParameters`, stakingParameters.parameters)
  })

  it(`has the expected html structure`, async () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should sort the delegates by selected property`, () => {
    wrapper.vm.sort.property = `operator_address`
    wrapper.vm.sort.order = `desc`

    expect(
      wrapper.vm.sortedFilteredEnrichedDelegates.map(x => x.operator_address)
    ).toEqual(lcdClientMock.validators)

    wrapper.vm.sort.property = `operator_address`
    wrapper.vm.sort.order = `asc`

    expect(
      wrapper.vm.sortedFilteredEnrichedDelegates.map(x => x.operator_address)
    ).toEqual(lcdClientMock.validators.reverse())
  })

  it(`should filter the delegates`, () => {
    store.commit(`setSearchVisible`, [`delegates`, true])
    store.commit(`setSearchQuery`, [
      `delegates`,
      lcdClientMock.validators[2].substr(20, 26)
    ])
    expect(
      wrapper.vm.sortedFilteredEnrichedDelegates.map(x => x.operator_address)
    ).toEqual([lcdClientMock.validators[2]])
    expect(wrapper.vm.$el).toMatchSnapshot()
    store.commit(`setSearchQuery`, [
      `delegates`,
      lcdClientMock.validators[1].substr(20, 26)
    ])
    expect(
      wrapper.vm.sortedFilteredEnrichedDelegates.map(x => x.operator_address)
    ).toEqual([lcdClientMock.validators[1]])
  })

  it(`should update 'somethingToSearch' when there's nothing to search`, () => {
    expect(wrapper.vm.somethingToSearch).toBe(true)
    wrapper.setProps({ validators: [] })
    expect(wrapper.vm.somethingToSearch).toBe(false)
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

  describe(`setSearch`, () => {
    it(`should show search when there is something to search`, () => {
      const $store = {
        commit: jest.fn()
      }

      TableValidators.methods.setSearch(true, {
        somethingToSearch: true,
        $store
      })

      expect($store.commit.mock.calls).toEqual([
        [`setSearchVisible`, [`delegates`, true]]
      ])
    })

    it(`should not show search when there is nothing to search`, () => {
      const $store = {
        commit: jest.fn()
      }

      TableValidators.methods.setSearch(true, {
        somethingToSearch: false,
        $store
      })

      expect($store.commit.mock.calls).toEqual([])
    })
  })
})
