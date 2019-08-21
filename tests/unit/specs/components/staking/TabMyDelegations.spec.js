import { shallowMount } from "@vue/test-utils"
import TabMyDelegations from "src/components/staking/TabMyDelegations"
import validators from "../../store/json/validators.js"
import { flatOrderedTransactionList } from "../../store/json/txs"

describe(`Component: TabMyDelegations`, () => {
  const state = {
    session: { signedIn: true }
  }
  const getters = {
    committedDelegations: {
      [validators[0].operator_address]: 42
    },
    connected: true,
    bondDenom: `uatom`,
    flatOrderedTransactionList
  }

  let wrapper, $store, $apollo, $route

  beforeEach(() => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      state,
      getters
    }

    $apollo = {
      queries: {
        validators: {
          loading: false
        }
      }
    }

    $route = {
      path: `/staking/my-delegations`
    }

    wrapper = shallowMount(TabMyDelegations, {
      mocks: {
        $store,
        $apollo,
        $route
      },
      stubs: [`router-link`]
    })
    wrapper.setData({ validators: [validators[0]] })
  })

  it(`should show committed validators`, () => {
    $store.getters.committedDelegations = expect(
      wrapper.element
    ).toMatchSnapshot()
  })

  it(`should show message when no commited validators`, () => {
    wrapper.setData({ validators: [] })
    expect(wrapper.text()).toMatch(/No Active Delegations/)
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`should show sign in message when not signed in`, () => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      state: {
        delegation: {
          unbondingDelegations: {},
          loaded: true
        },
        session: { signedIn: false }
      },
      getters
    }
    wrapper = shallowMount(TabMyDelegations, {
      mocks: {
        $store,
        $apollo
      },
      stubs: [`router-link`]
    })
    expect(wrapper.find("cardsigninrequired-stub").exists()).toBe(true)
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`should show message when loading and not connected`, () => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      state: {
        session: { signedIn: true }
      },
      getters: {
        committedDelegations: {
          [validators[0].operator_address]: 42
        },
        connected: false,
        bondDenom: `uatom`,
        flatOrderedTransactionList
      }
    }
    wrapper = shallowMount(TabMyDelegations, {
      mocks: {
        $store,
        $apollo: {
          queries: {
            validators: {
              loading: true
            }
          }
        }
      },
      stubs: [`router-link`]
    })
    console.log(wrapper.html())
    expect(wrapper.find("TmDataConnecting-stub").exists()).toBe(true)
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`should show loading message`, () => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      state: {
        session: { signedIn: true }
      },
      getters: {
        committedDelegations: {
          [validators[0].operator_address]: 42
        },
        connected: true,
        bondDenom: `uatom`,
        flatOrderedTransactionList
      }
    }
    wrapper = shallowMount(TabMyDelegations, {
      mocks: {
        $store,
        $apollo: {
          queries: {
            validators: {
              loading: true
            }
          }
        }
      },
      stubs: [`router-link`]
    })
    expect(wrapper.find("TmDataLoading-stub").exists()).toBe(true)
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`should show pending undelegations`, () => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      state: {
        session: { signedIn: true }
      },
      getters
    }

    $store.getters.committedDelegations = {
      [`cosmos1`]: 42
    }

    wrapper = shallowMount(TabMyDelegations, {
      mocks: {
        $store,
        $apollo
      },
      stubs: [`router-link`, `tablevalidators-stub`]
    })

    expect(wrapper.html()).toMatch(/Pending Undelegations/)
    expect(wrapper.element).toMatchSnapshot()
  })
})
