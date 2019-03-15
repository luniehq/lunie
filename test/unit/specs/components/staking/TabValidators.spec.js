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

  it(`shows a message if still connecting`, async () => {
    $store = {
      dispatch: jest.fn(),
      getters: {
        delegates: {
          delegates: validators,
          loading: false,
          loaded: false
        },
        committedDelegations: {
          [validators[0].operator_address]: 42
        },
        session: {
          signedIn: true
        },
        connected: false,
        lastHeader: { height: 20 }
      }
    }

    wrapper = shallowMount(TabValidators, {
      mocks: {
        $store
      }
    })

    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`shows a message if still loading`, async () => {
    $store = {
      dispatch: jest.fn(),
      getters: {
        delegates: {
          delegates: validators,
          loading: true,
          loaded: false
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
    }

    wrapper = shallowMount(TabValidators, {
      mocks: {
        $store
      }
    })

    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`shows a message if there is nothing to display`, async () => {
    $store = {
      dispatch: jest.fn(),
      getters: {
        delegates: {
          delegates: [],
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
    }

    wrapper = shallowMount(TabValidators, {
      mocks: {
        $store
      }
    })

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
})
