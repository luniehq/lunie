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
    TableValidators.watch.address.call({ updateDelegates }, `cosmos1address`)
    expect(updateDelegates).toHaveBeenCalled()
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
      const session = { signedIn: true }
      const $store = { dispatch: jest.fn() }
      TableValidators.watch.validators.call({ $store, session }, validators)
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
        const session = { signedIn: false }
        const $store = { dispatch: jest.fn() }
        TableValidators.watch.validators.call({ $store, session }, validators)
        expect($store.dispatch).not.toHaveBeenCalledWith(
          `getRewardsFromAllValidators`,
          validators
        )
      })

      it(`if validator set is empty`, () => {
        const validators = []
        const session = { signedIn: true }
        const $store = { dispatch: jest.fn() }
        TableValidators.watch.validators.call({ $store, session }, validators)
        expect($store.dispatch).not.toHaveBeenCalledWith(
          `getRewardsFromAllValidators`,
          validators
        )
      })

      it(`if validator set is undefined`, () => {
        const validators = undefined
        const session = { signedIn: true }
        const $store = { dispatch: jest.fn() }
        TableValidators.watch.validators.call({ $store, session }, validators)
        expect($store.dispatch).not.toHaveBeenCalledWith(
          `getRewardsFromAllValidators`,
          validators
        )
      })
    })
  })
})
