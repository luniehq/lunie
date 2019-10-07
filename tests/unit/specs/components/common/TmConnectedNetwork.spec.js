import { shallowMount, createLocalVue } from "@vue/test-utils"
import TmConnectedNetwork from "common/TmConnectedNetwork"

const localVue = createLocalVue()
localVue.directive(`tooltip`, () => { })

describe(`TmConnectedNetwork`, () => {
  let wrapper, $store

  beforeEach(() => {
    $store = {
      state: {
        connection: {
          connected: true
        }
      }
    }

    wrapper = shallowMount(TmConnectedNetwork, {
      localVue,
      mocks: {
        $store
      },
      stubs: [`router-link`]
    })
  })

  it(`has the expected html structure`, () => {
    wrapper.setData({
      block: {
        chainId: "gaia-20k",
        height: 6001
      }
    })
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`has a network string`, () => {
    wrapper.setData({
      block: {
        chainId: "gaia-20k",
        height: 6001
      }
    })
    expect(wrapper.find(`#tm-connected-network__string`).text()).toMatch(
      /gaia-20k/
    )
  })

  it(`has a block string`, () => {
    wrapper.setData({
      block: {
        chainId: "gaia-20k",
        height: 6001
      }
    })
    expect(wrapper.find(`#tm-connected-network__block`).text()).toMatch(
      /#6,001/
    )
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
        $store
      },
      stubs: [`router-link`]
    })
    expect(wrapper.element).toMatchSnapshot()
  })
})
