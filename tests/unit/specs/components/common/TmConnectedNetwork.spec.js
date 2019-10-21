import { shallowMount, createLocalVue } from "@vue/test-utils"
import TmConnectedNetwork from "common/TmConnectedNetwork"

const localVue = createLocalVue()
localVue.directive(`tooltip`, () => { })

describe(`TmConnectedNetwork`, () => {
  let wrapper, $store, $apollo

  beforeEach(() => {
    $store = {
      state: {
        connection: {
          network: "networkId"
        }
      }
    }

    $apollo = {
      queries: {
        block: {
          loading: false
        }
      }
    }

    wrapper = shallowMount(TmConnectedNetwork, {
      localVue,
      mocks: {
        $store,
        $apollo
      },
      stubs: [`router-link`]
    })
  })

  it(`has the expected html structure when connected`, () => {
    wrapper.setData({
      block: {
        chainId: "gaia-20k",
        height: 6001
      }
    })
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`has a connecting state`, async () => {
    $store = {
      state: {
        connection: {
          connected: false
        }
      }
    }

    wrapper = shallowMount(TmConnectedNetwork, {
      localVue,
      mocks: {
        $store,
        $apollo
      },
      stubs: [`router-link`]
    })
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`has the correct network strings`, () => {
    wrapper.setData({
      block: {
        chainId: "gaia-20k",
        height: 6001
      }
    })
    expect(wrapper.find(`#tm-connected-network__string`).text()).toMatch(
      /gaia-20k/
    )
    expect(wrapper.find(`#tm-connected-network__block`).text()).toMatch(
      /#6,001/
    )
  })
})
