import { shallowMount } from "@vue/test-utils"
import PageValidators from "staking/PageValidators"
import validators from "../../store/json/validators.js"

describe(`PageValidators`, () => {
  let wrapper, $store

  const state = {
    session: {
      signedIn: true
    },
    delegates: {
      delegates: validators,
      loading: false,
      loaded: true
    }
  }

  const getters = {
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
      getters,
      state
    }

    wrapper = shallowMount(PageValidators, {
      mocks: {
        $store
      }
    })
  })

  it(`shows a list of validators`, async () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`shows a message if still connecting`, async () => {
    $store = {
      dispatch: jest.fn(),
      state: {
        session: {
          signedIn: true
        },
        delegates: {
          delegates: validators,
          loading: false,
          loaded: false
        }
      },
      getters: {
        committedDelegations: {
          [validators[0].operator_address]: 42
        },
        connected: false,
        lastHeader: { height: 20 },
        yourValidators: validators
      }
    }

    wrapper = shallowMount(PageValidators, {
      mocks: {
        $store
      }
    })

    expect(wrapper.element).toMatchSnapshot()
  })

  it(`shows a message if still loading`, async () => {
    $store = {
      dispatch: jest.fn(),
      state: {
        session: {
          signedIn: true
        },
        delegates: {
          delegates: validators,
          loading: true,
          loaded: false
        }
      },
      getters: {
        committedDelegations: {
          [validators[0].operator_address]: 42
        },
        connected: true,
        lastHeader: { height: 20 },
        yourValidators: validators
      }
    }

    wrapper = shallowMount(PageValidators, {
      mocks: {
        $store
      }
    })

    expect(wrapper.element).toMatchSnapshot()
  })

  it(`shows a message if there is nothing to display`, async () => {
    $store = {
      dispatch: jest.fn(),
      state: {
        session: {
          signedIn: true
        },
        delegates: {
          delegates: [],
          loading: false,
          loaded: true
        }
      },
      getters: {
        committedDelegations: {
          [validators[0].operator_address]: 42
        },
        connected: true,
        lastHeader: { height: 20 },
        yourValidators: validators
      }
    }

    wrapper = shallowMount(PageValidators, {
      mocks: {
        $store
      }
    })

    expect(wrapper.element).toMatchSnapshot()
  })
})
