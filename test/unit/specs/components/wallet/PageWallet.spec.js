import { shallowMount, createLocalVue } from "@vue/test-utils"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"
import PageWallet from "renderer/components/wallet/PageWallet"

describe(`PageWallet`, () => {
  const localVue = createLocalVue()
  localVue.directive(`tooltip`, () => { })

  let wrapper, $store
  const getters = {
    wallet: {
      loading: false,
      denoms: [`fermion`, `gregcoin`, `mycoin`, `STAKE`],
      balances: lcdClientMock.state.accounts[lcdClientMock.addresses[0]].coins,
      externals: { config: { faucet: `yo` } }
    },
    connected: true
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

  it(`has the expected html structure`, async () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should sort the balances by amount desc and denom asc`, () => {
    expect(wrapper.vm.filteredBalances.map(x => x.denom)).toEqual([
      `fermion`,
      `mycoin`,
      `STAKE`,
      `gregcoin`
    ])
  })

  it(`should list the denoms that are available`, () => {
    expect(wrapper.findAll(`.tm-li-balance`).length).toBe(4)
  })

  it(`should show the n/a message if there are no denoms`, async () => {
    wrapper.setData({
      wallet: {
        denoms: [`fermion`, `gregcoin`, `mycoin`, `STAKE`],
        balances: []
      }
    })

    expect(wrapper.find(`#account_empty_msg`).exists()).toBeTruthy()
  })

  it(`should not show the n/a message if there are denoms`, () => {
    expect(wrapper.vm.allDenomBalances.length).not.toBe(0)
    expect(wrapper.vm.$el.querySelector(`#no-balances`)).toBe(null)
  })

  it(`should show a message when still connecting`, () => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: Object.assign({}, getters, {
        wallet: {
          loaded: false,
          denoms: [`fermion`, `gregcoin`, `mycoin`, `STAKE`],
          balances: [],
          externals: { config: {} }
        },
        connected: false
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
          denoms: [`fermion`, `gregcoin`, `mycoin`, `STAKE`],
          balances: [],
          externals: { config: {} }
        },
        connected: true
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

  it(`should show the sending modal`, () => {
    wrapper.vm.showModal(`STAKE`)
    expect(wrapper.exists(`send-modal`)).toBe(true)
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should call getmoney`, async () => {
    await PageWallet.methods.faucet.call({ $store, session: { address: `X` } })
    expect($store.dispatch).toHaveBeenCalledWith(`getMoney`, `X`)
  })
})
