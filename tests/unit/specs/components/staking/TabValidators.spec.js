import { shallowMount } from "@vue/test-utils"
import TabValidators from "src/components/staking/TabValidators"
import validators from "../../store/json/validators.js"

describe(`TabValidators`, () => {
  let wrapper, $store

  const state = {
    session: {
      signedIn: true
    }
  }

  const getters = {
    delegates: {
      delegates: validators,
      loading: false,
      loaded: true
    },
    committedDelegations: {
      [validators[0].operator_address]: 42
    },

    connected: true,
    lastHeader: { height: 20 },
    yourValidators: validators
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
      state,
      getters: {
        delegates: {
          delegates: validators,
          loading: false,
          loaded: false
        },
        committedDelegations: {
          [validators[0].operator_address]: 42
        },
        connected: false,
        lastHeader: { height: 20 },
        yourValidators: validators
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
      state,
      getters: {
        delegates: {
          delegates: validators,
          loading: true,
          loaded: false
        },
        committedDelegations: {
          [validators[0].operator_address]: 42
        },
        connected: true,
        lastHeader: { height: 20 },
        yourValidators: validators
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
      state,
      getters: {
        delegates: {
          delegates: [],
          loading: false,
          loaded: true
        },
        committedDelegations: {
          [validators[0].operator_address]: 42
        },
        connected: true,
        lastHeader: { height: 20 },
        yourValidators: validators
      }
    }

    wrapper = shallowMount(TabValidators, {
      mocks: {
        $store
      }
    })

    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
