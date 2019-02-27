import { shallowMount } from "@vue/test-utils"
import TabValidators from "renderer/components/staking/TabValidators"

// we don't show data of a validator in this component so we just provide stubs here
const delegates = new Array(3).fill({})

describe(`TabValidators`, () => {
  let wrapper, $store

  const getters = {
    delegates: {
      delegates,
      loading: false,
      loaded: true
    },
    session: {
      signedIn: true
    },
    connected: true
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
          delegates,
          loading: false,
          loaded: false
        },
        session: {
          signedIn: true
        },
        connected: false
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
          delegates,
          loading: true,
          loaded: false
        },
        session: {
          signedIn: true
        },
        connected: true
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
        session: {
          signedIn: true
        },
        connected: true
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
})
