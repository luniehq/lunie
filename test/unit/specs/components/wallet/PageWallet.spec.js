import { shallowMount, createLocalVue } from "@vue/test-utils"
import mockValues from "test/unit/helpers/mockValues.js"
import PageWallet from "src/components/wallet/PageWallet"

describe(`PageWallet`, () => {
  const localVue = createLocalVue()
  localVue.directive(`tooltip`, () => {})

  let wrapper, $store
  const getters = {
    wallet: {
      loading: false,
      balances: mockValues.state.accounts[mockValues.addresses[0]].coins,
      externals: { config: { faucet: `yo` } }
    },
    lastHeader: { height: `20` },
    connected: true,
    session: { signedIn: true }
  }

  beforeEach(() => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters
    }

    wrapper = shallowMount(PageWallet, {
      localVue,
      mocks: {
        $store
      }
    })
    wrapper.vm.$refs.sendModal = { open: jest.fn() }
  })

  it(`should display the wallet page`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should show the sending modal`, () => {
    wrapper.vm.showModal(`STAKE`)
    expect(wrapper.exists(`send-modal`)).toBe(true)
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should not show denoms or the faucet button for a user who is not signed in`, () => {
    $store.getters.session.signedIn = false
    wrapper = shallowMount(PageWallet, {
      localVue,
      mocks: {
        $store
      }
    })

    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should sort the balances by amount desc and denom asc`, () => {
    expect(wrapper.vm.filteredBalances.map(x => x.denom)).toEqual([
      `fermion`,
      `mycoin`,
      `STAKE`
    ])
  })

  it(`should not show the empty placeholder if there are denoms`, () => {
    expect(wrapper.vm.wallet.balances.length).not.toBe(0)
    expect(wrapper.vm.dataEmpty).toBe(false)

    wrapper.setData({
      wallet: {
        balances: []
      }
    })
    expect(wrapper.vm.dataEmpty).toBe(true)
  })

  it(`should show a message when still connecting`, () => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: Object.assign({}, getters, {
        wallet: {
          loaded: false,
          balances: [],
          externals: { config: {} }
        },
        connected: false,
        lastHeader: ``,
        session: { signedIn: true }
      })
    }

    wrapper = shallowMount(PageWallet, {
      localVue,
      mocks: {
        $store
      }
    })

    expect(wrapper.exists(`tm-data-connecting`)).toBe(true)
  })

  it(`should show a message when still loading`, () => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: Object.assign({}, getters, {
        wallet: {
          loading: true,
          loaded: false,
          balances: [],
          externals: { config: {} }
        },
        connected: true,
        lastHeader: ``,
        session: { signedIn: true }
      })
    }

    wrapper = shallowMount(PageWallet, {
      localVue,
      mocks: {
        $store
      }
    })
    expect(wrapper.exists(`tm-data-loading`)).toBe(true)
  })
})
