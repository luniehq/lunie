import { shallowMount, createLocalVue } from "@vue/test-utils"
import PageNetwork from "src/components/network/PageNetwork"

const localVue = createLocalVue()
localVue.directive(`tooltip`, () => {})

describe(`PageNetwork`, () => {
  let wrapper
  const $store = {
    state: {
      pool: {
        pool: {
          bonded_tokens: 18056799300.444444,
          not_bonded_tokens: 9008256400.444444
        }
      },
      delegates: {
        delegates: [
          {
            a: `b`,
            c: `d`
          }
        ]
      }
    },
    getters: {
      connected: true,
      lastHeader: {
        chain_id: `gaia-20k`,
        proposer_address: `EFH47FH723HDHSH`,
        height: `6001`,
        total_txs: `108`,
        time: Date.now()
      },
      bondDenom: `stake`,
      blocks: [
        {
          header: {
            height: `100`,
            num_txs: 1200,
            proposer_address: `ABCDEFG123456HIJKLMNOP`
          }
        },
        {
          header: {
            height: `101`,
            num_txs: 405,
            proposer_address: `ZYXCRS123456HIJKLMNOPQ`
          }
        }
      ]
    },
    dispatch: jest.fn()
  }

  beforeEach(() => {
    wrapper = shallowMount(PageNetwork, {
      localVue,
      mocks: {
        $store
      },
      stubs: [`router-link`]
    })
  })

  it(`should display the network page with data and the blocks table`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should display the network page with the blocks table in a loading state`, () => {
    $store.getters.blocks = []

    wrapper = shallowMount(PageNetwork, {
      localVue,
      mocks: {
        $store
      },
      stubs: [`router-link`]
    })

    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`sets the status correctly`, () => {
    expect(wrapper.vm.status).toEqual({
      color: `green`,
      message: `Network is up and running`
    })

    $store.getters.connected = false

    wrapper = shallowMount(PageNetwork, {
      localVue,
      mocks: {
        $store
      },
      stubs: [`router-link`]
    })

    expect(wrapper.vm.status).toEqual({
      color: `red`,
      message: `Not connected to a node`
    })
  })

  it(`sets last block to something human readable`, () => {
    expect(wrapper.vm.lastBlock).toEqual(`a few seconds ago`)
  })

  it(`sets properties for the block table`, () => {
    expect(wrapper.vm.properties).toEqual([
      {
        title: `Block Number`,
        value: `block_number`,
        tooltip: `Block Number`,
        class: `blockNumber`
      },
      {
        title: `Transactions`,
        value: `transactions`,
        tooltip: `Number of transactions per block`,
        class: `transactions`
      }
    ])
  })
})
