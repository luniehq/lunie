import { shallowMount, createLocalVue } from "@vue/test-utils"
import PageBlock from "network/PageBlock"

const localVue = createLocalVue()
localVue.directive(`tooltip`, () => {})

describe(`PageBlock`, () => {
  let wrapper

  const getters = {
    connected: true,
    address: `cosmos1`
  }

  const state = {
    session: { address: `` }
  }

  const $apollo = {
    queries: {
      block: {
        loading: false
      }
    }
  }

  const block = {
    chainId: "gaia-13006",
    hash: "1502BF74E13670334E42A9A0648719DFA0AF36B8FF1362601C101CF2D781C476",
    height: 524084,
    networkId: "gaia-testnet",
    proposer_address: "C696FEA7DBD3A064ED66C7C8C806F260C18EB179",
    time: "2019-09-24T13:03:47.985027686Z",
    transactions: [
      {
        type: "cosmos-sdk/MsgSend",
        hash:
          "01735A10A9B701A76A67BF92DCFBC0A4B61DB9D202D60587C902E0F197FD6A71",
        height: 524084,
        group: "banking",
        timestamp:
          "[native Date Tue Sep 24 2019 09:03:47 GMT-0400 (Nordamerikanische Ostküsten-Sommerzeit)]",
        gasUsed: 40171,
        gasWanted: 50000,
        success: true,
        log: "",
        memo: "",
        fee: { amount: "0.00125", denom: "MUON", __typename: "Coin" },
        signature:
          "Wg+iANtNPTitYI7dwsUfT2Edn0JMt6Fwpv1SSQs/GvVgGiZsw5nMDrEV4Wd1LaT1FqVK5w2fP4j5pnQNs0Sxtw==",
        value: {
          from_address: "cosmos1ek9cd8ewgxg9w5xllq9um0uf4aaxaruvcw4v9e",
          to_address: "cosmos1j0clrcqrzca52lagpz27hwtq74wl2re5484awh",
          amount: [{ denom: "muon", amount: "100000" }]
        },
        amount: null,
        __typename: "Transaction"
      }
    ]
  }

  beforeEach(async () => {
    wrapper = shallowMount(PageBlock, {
      localVue,
      mocks: {
        $store: {
          getters,
          state
        },
        $route: {
          params: { height: `100` }
        },
        $router: {
          push: jest.fn()
        },
        $apollo
      },
      stubs: [`router-link`]
    })

    wrapper.setData({
      block
    })
  })

  it(`shows a page with information about a certain block`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`shows the block page with no txs`, () => {
    wrapper.setData({
      block: {
        ...block,
        transactions: []
      }
    })

    expect(wrapper.element).toMatchSnapshot()
  })
})
