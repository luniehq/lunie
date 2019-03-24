import { shallowMount } from "@vue/test-utils"
import TabValidators from "renderer/components/staking/TabValidators"
import validators from "../../store/json/validators.js"

describe(`TabValidators`, () => {
  let wrapper, $store

  const getters = {
    delegates: {
      delegates: validators,
      loading: false,
      loaded: true
    },
    committedDelegations: {
      [validators[0].operator_address]: 42
    },
    session: {
      signedIn: true
    },
    connected: true,
    lastHeader: { height: 20 }
  }

  beforeEach(async () => {
    $store = {
      dispatch: jest.fn(),
      getters
    }

    wrapper = shallowMount(TabValidators, {
      mocks: {
        $store
      }
    })
  })

  it(`shows a list of validators`, async () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`queries for validators and delegations on mount`, () => {
    const dispatch = jest.fn()
    TabValidators.mounted.call({
      $store: {
        dispatch
      }
    })
    expect(dispatch).toHaveBeenCalledWith(`updateDelegates`)
  })

  it(`queries for validators and delegations on sign in`, () => {
    const dispatch = jest.fn()
    TabValidators.watch[`session.signedIn`].call({
      $store: {
        dispatch
      }
    }, true)
    expect(dispatch).toHaveBeenCalledWith(`updateDelegates`)
  })

  describe(`yourValidators`, () => {
    it(`should return validators if signed in`, () => {
      expect(
        TabValidators.computed.yourValidators({
          committedDelegations: {
            [validators[0].operator_address]: 1,
            [validators[2].operator_address]: 2
          },
          delegates: { delegates: validators },
          session: { signedIn: true }
        })
      ).toEqual([validators[0], validators[2]])
    })

    it(`should return false if not signed in`, () => {
      expect(
        TabValidators.computed.yourValidators({
          committedDelegations: {
            [validators[0].operator_address]: 1,
            [validators[2].operator_address]: 2
          },
          delegates: { delegates: validators },
          session: { signedIn: false }
        })
      ).toBe(false)
    })
  })

  describe(`update rewards on new blocks`, () => {
    describe(`shouldn't update`, () => {
      it(`if hasn't waited for 20 blocks `, () => {
        const $store = { dispatch: jest.fn() }
        const yourValidators = [{}]
        const newHeader = { height: `30` }
        TabValidators.watch.lastHeader.handler.call(
          { $store, yourValidators },
          newHeader)
        expect($store.dispatch).not.toHaveBeenCalledWith(
          `getRewardsFromAllValidators`,
          yourValidators
        )
      })

      it(`if user doesn't have any delegations `, () => {
        const $store = { dispatch: jest.fn() }
        const yourValidators = []
        const newHeader = { height: `40` }
        TabValidators.watch.lastHeader.handler.call(
          { $store, yourValidators },
          newHeader)
        expect($store.dispatch).not.toHaveBeenCalledWith(
          `getRewardsFromAllValidators`,
          yourValidators
        )
      })

      describe(`should update rewards `, () => {
        it(`if has waited for 20 blocks and has delegations`, () => {
          const $store = { dispatch: jest.fn() }
          const yourValidators = [{}]
          const newHeader = { height: `40` }
          TabValidators.watch.lastHeader.handler.call(
            { $store, yourValidators },
            newHeader)
          expect($store.dispatch).toHaveBeenCalledWith(
            `getRewardsFromAllValidators`,
            yourValidators
          )
        })
      })
    })
  })
})
