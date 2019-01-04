import setup from "../../../helpers/vuex-setup"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"
import TabMyDelegations from "renderer/components/staking/TabMyDelegations"

const delegates = lcdClientMock.candidates

// TODO: remove this dirty addition: the real cleanup will be done in a separate PR
// the problem is mock VS real implementation have different keys: shares in mock, shares_amount in SDK
const unbondingTransactions = lcdClientMock.state.txs.slice(5).map(t => {
  t.tx.value.msg[0].value.shares_amount = t.tx.value.msg[0].value.shares
  return t
})

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
          },
          loaded: true
        }),
        bondingDenom: () => `stake`,
        connected: () => true
      }
    })

    expect(instance.wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should show unbonding validators and the current committed validator`, () => {
    const address = delegates[0].operator_address
    let instance = mount(TabMyDelegations, {
      getters: {
        // We decided that is should not be possible to undelegate from something that is not committed
        committedDelegations: () => ({
          [address]: 1
        }),
        delegates: () => ({
          delegates
        }),
        delegation: () => ({
          unbondingDelegations: {
            [address]: {
              creation_height: `170`,
              min_time: new Date().toISOString()
            }
          },
          loaded: true
        }),
        bondingDenom: () => `stake`,
        connected: () => true,
        allTransactions: () => unbondingTransactions
      }
    })

    expect(instance.wrapper.html()).toContain(`Unbonding transactions`)
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
        bondingDenom: () => `stake`,
        connected: () => true
      }
    })

    expect(instance.wrapper.html()).toContain(`No Active Delegations`)
    expect(instance.wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should show a message if not still connecting to a node`, () => {
    let instance = mount(TabMyDelegations, {
      getters: {
        committedDelegations: () => ({}),
        delegates: () => ({
          delegates
        }),
        delegation: () => ({
          unbondingDelegations: {},
          loaded: false
        }),
        bondingDenom: () => `stake`,
        connected: () => false
      },
      stubs: {
        "tm-data-connecting": true
      }
    })

    expect(instance.wrapper.exists(`tm-data-connecting`)).toBe(true)
  })

  it(`should show a message if not still loading delegations`, () => {
    let instance = mount(TabMyDelegations, {
      getters: {
        committedDelegations: () => ({}),
        delegates: () => ({
          delegates
        }),
        delegation: () => ({
          unbondingDelegations: {},
          loaded: true,
          loading: true
        }),
        bondingDenom: () => `stake`,
        connected: () => false
      },
      stubs: {
        "tm-data-loading": true
      }
    })

    expect(instance.wrapper.exists(`tm-data-loading`)).toBe(true)
  })

  it(`unbondingTransactions`, async () => {
    const address = delegates[0].operator_address
    const transactions = await lcdClientMock.getDelegatorTxs(
      lcdClientMock.addresses[0]
    )

    expect(
      TabMyDelegations.computed.unbondingTransactions({
        delegation: {
          unbondingDelegations: {
            [address]: {
              creation_height: `170`,
              min_time: new Date().toISOString()
            }
          }
        },
        allTransactions: transactions
      })
    ).toHaveLength(1)
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
