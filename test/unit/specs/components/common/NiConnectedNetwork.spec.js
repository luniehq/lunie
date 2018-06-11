import Vuex from "vuex"
import { mount, createLocalVue } from "@vue/test-utils"
import htmlBeautify from "html-beautify"
import NiConnectedNetwork from "common/NiConnectedNetwork"

const localVue = createLocalVue()
localVue.use(Vuex)

describe("NiConnectedNetwork", () => {
  let wrapper
  let store = new Vuex.Store({
    getters: {
      connected: () => true,
      lastHeader: () => ({ chain_id: "gaia-home", height: "31337" }),
      nodeIP: () => "127.0.0.1",
      mockedConnector: () => false
    }
  })
  store.commit = jest.fn()

  beforeEach(() => {
    wrapper = mount(NiConnectedNetwork, {
      localVue,
      store
    })
  })

  it("has the expected html structure", () => {
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  it("has a network icon", () => {
    expect(
      wrapper
        .find("#ni-connected-network__icon i.material-icons")
        .text()
        .trim()
    ).toBe("wifi")
  })

  it("has a network string", () => {
    expect(
      wrapper
        .find("#ni-connected-network__string")
        .text()
        .trim()
    ).toBe("Connected to gaia-home via 127.0.0.1 (change network)")
  })

  it("has a block string", () => {
    expect(
      wrapper
        .find("#ni-connected-network__block")
        .text()
        .trim()
    ).toBe("Current Block: #31,337")
  })
})
