import { shallowMount, createLocalVue } from "@vue/test-utils"
import PageNetwork from "renderer/components/network/PageNetwork"

const localVue = createLocalVue()
localVue.directive(`tooltip`, () => {})

describe(`PageNetwork`, () => {
  let wrapper, $store

  beforeEach(() => {
    $store = {
      getters: {
        connected: true,
        lastHeader: {
          chain_id: `gaia-20k`,
          proposer_address: `EFH47FH723HDHSH`,
          height: `6001`,
          total_txs: `108`,
          time: Date.now()
        },
        delegates: {
          delegates: [
            {
              a: `b`,
              c: `d`
            }
          ]
        },
        config: {
          devMode: true
        },
        pool: {
          pool: {
            bonded_tokens: 125,
            loose_tokens: 10
          }
        },
        bondDenom: `stake`
      }
    }

    wrapper = shallowMount(PageNetwork, {
      localVue,
      mocks: {
        $store
      }
    })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`sets the status correctly`, () => {
    expect(wrapper.vm.status).toEqual({
      color: `green`,
      message: `Network is up and running`
    })

    $store = {
      getters: {
        connected: false
      }
    }

    wrapper = shallowMount(PageNetwork, {
      localVue,
      mocks: {
        $store
      }
    })

    expect(wrapper.vm.status).toEqual({
      color: `red`,
      message: `Network is down`
    })
  })
})
