import { shallowMount, createLocalVue } from "@vue/test-utils"
import TmConnectedNetwork from "common/TmConnectedNetwork"

const localVue = createLocalVue()
localVue.directive(`tooltip`, () => {})

describe(`TmConnectedNetwork`, () => {
  let wrapper, $store

  beforeEach(() => {
    $store = {
      state: {
        connection: {
          connected: true,
          network: "gaia-20k",
          nodeUrl: `https://faboNode.de`,
          lastHeader: {
            height: `6001`
          }
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
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`has a network string`, () => {
    expect(wrapper.find(`#tm-connected-network__string`).text()).toMatch(
      /gaia-20k/
    )
  })

  it(`has a block string`, () => {
    expect(wrapper.find(`#tm-connected-network__block`).text()).toMatch(
      /#6,001/
    )
  })

  it(`has a connecting state`, async () => {
    $store = {
      state: {
        connection: {
          connected: false,
          network: "cosmoshub",
          nodeUrl: null,
          lastHeader: {
            height: `6001`
          }
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
