import { shallowMount, createLocalVue } from "@vue/test-utils"
import TmConnectedNetwork from "common/TmConnectedNetwork"

const localVue = createLocalVue()
localVue.directive(`tooltip`, () => {})

jest.mock(`src/../config.js`, () => ({
  mobileApp: true
}))

describe(`TmConnectedNetwork`, () => {
  let wrapper, $store, $apollo, dispatch

  beforeEach(() => {
    dispatch = jest.fn()
    $store = {
      commit: jest.fn(),
      state: {
        connection: {
          network: "networkId"
        }
      },
      dispatch
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

  it(`handleClick should emit a close-menu event and scroll to 0,0`, () => {
    global.window = Object.create(window)
    Object.defineProperty(window, `scrollTo`, {
      value: jest.fn()
    })
    const self = {
      $emit: jest.fn()
    }
    TmConnectedNetwork.methods.handleClick.call(self)
    expect(self.$emit).toHaveBeenCalledWith("close-menu")
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0)
  })

  it(`handleIntercom should dispatch displayMessenger action`, () => {
    wrapper.vm.handleIntercom()
    expect(dispatch).toHaveBeenCalledWith(`displayMessenger`)
  })
})
