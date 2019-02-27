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
      stubs: {
        "short-bech32": true
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
    expect(
      wrapper.vm.sortedFilteredEnrichedDelegates.map(x => x.operator_address)
    ).toEqual([
      `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au`,
      `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctgurrg7n`,
      `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw`
    ])
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
    const updateDelegates = jest.fn()
    TableValidators.watch.signedIn.call({ updateDelegates }, true)
    expect(updateDelegates).toHaveBeenCalled()
  })
})
