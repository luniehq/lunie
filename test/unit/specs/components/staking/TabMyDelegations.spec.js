import setup from "../../../helpers/vuex-setup"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"
import TabMyDelegations from "renderer/components/staking/TabMyDelegations"

const delegates = lcdClientMock.candidates

describe(`Component: TabMyDelegations`, () => {
  let { mount } = setup()

  it(`should show committed validators`, () => {
    let instance = mount(TabMyDelegations, {
      getters: {
        committedDelegations: () => ({
          [delegates[0].operator_address]: 42
        }),
        delegates: () => ({
          delegates
        }),
        delegation: () => ({
          unbondingDelegations: {
            [delegates[1].operator_address]: 1,
            [delegates[2].operator_address]: 2
          }
        }),
        bondingDenom: () => `stake`
      }
    })

    expect(instance.wrapper.html()).toContain(`Active Delegations`)
    expect(instance.wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should show unbonding validators`, () => {
    let instance = mount(TabMyDelegations, {
      getters: {
        committedDelegations: () => ({}),
        delegates: () => ({
          delegates
        }),
        delegation: () => ({
          unbondingDelegations: {
            [delegates[1].operator_address]: 1,
            [delegates[2].operator_address]: 2
          }
        }),
        bondingDenom: () => `stake`
      }
    })

    expect(instance.wrapper.html()).toContain(`Inactive Delegations`)
    expect(instance.wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should show a message if not staked yet to any validator`, () => {
    let instance = mount(TabMyDelegations, {
      getters: {
        committedDelegations: () => ({}),
        delegates: () => ({
          delegates
        }),
        delegation: () => ({
          unbondingDelegations: {}
        }),
        bondingDenom: () => `stake`
      }
    })

    expect(instance.wrapper.html()).toContain(`No Active Delegations`)
    expect(instance.wrapper.vm.$el).toMatchSnapshot()
  })

  it(`undelegatedValidators`, () => {
    expect(
      TabMyDelegations.computed.undelegatedValidators({
        delegation: {
          unbondingDelegations: {
            [delegates[1].operator_address]: 1,
            [delegates[2].operator_address]: 2
          }
        },
        delegates: { delegates }
      })
    ).toEqual([delegates[1], delegates[2]])
  })

  it(`yourValidators`, () => {
    expect(
      TabMyDelegations.computed.yourValidators({
        committedDelegations: {
          [delegates[0].operator_address]: 1,
          [delegates[2].operator_address]: 2
        },
        delegates: { delegates }
      })
    ).toEqual([delegates[0], delegates[2]])
  })
})
