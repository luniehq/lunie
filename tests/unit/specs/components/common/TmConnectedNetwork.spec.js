import { shallowMount, createLocalVue } from "@vue/test-utils"
import TmConnectedNetwork from "common/TmConnectedNetwork"

const localVue = createLocalVue()
localVue.directive(`tooltip`, () => {})

describe(`TmConnectedNetwork`, () => {
  let wrapper, $store

  beforeEach(() => {
    $store = {
      getters: {
        lastHeader: {
          chain_id: `gaia-20k`,
          height: `6001`
        },
        nodeUrl: `https://faboNode.de`,
        connected: true
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
    expect(
      wrapper
        .find(`#tm-connected-network__string`)
        .text()
        .trim()
    ).toBe(`gaia-20k`)
  })

  it(`has a block string`, () => {
    expect(
      wrapper
        .find(`#tm-connected-network__block`)
        .text()
        .trim()
    ).toBe(`#6,001`)
  })

  it(`has a connecting state`, async () => {
    $store = {
      getters: {
        lastHeader: {
          chain_id: ``,
          height: ``
        },
        nodeUrl: null,
        connected: false
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
