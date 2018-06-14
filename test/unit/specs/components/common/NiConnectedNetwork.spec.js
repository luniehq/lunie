import NiConnectedNetwork from "common/NiConnectedNetwork"
import htmlBeautify from "html-beautify"
import setup from "../../../helpers/vuex-setup"

describe("NiConnectedNetwork", () => {
  let wrapper, router, store, instance
  let { mount } = setup()

  beforeEach(async () => {
    instance = mount(NiConnectedNetwork)
    store = instance.store
    router = instance.router
    wrapper = instance.wrapper
    await store.dispatch("setMockedConnector", true)
    wrapper.update()
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
    ).toBe("Connected to test-net via 127.0.0.1 (change network)")
  })

  it("has a block string", () => {
    expect(
      wrapper
        .find("#ni-connected-network__block")
        .text()
        .trim()
    ).toBe("Current Block: #42")
  })

  it("has a certain style for mockedConnector", () => {
    expect(wrapper.find("#ni-connected-network").classes()).toContain(
      "ni-connected-network--mocked"
    )
  })
  it("has a network tooltip for mockedConnector", () => {
    expect(wrapper.vm.networkTooltip).toBe(
      "Note: `mock-chain` does not have real peers."
    )
  })

  it("has a node address for mockedConnector", () => {
    expect(wrapper.vm.nodeAddress).toBe("127.0.0.1")
  })

  it("has a chain id for mockedConnector", () => {
    expect(wrapper.vm.chainId).toBe("test-net")
  })

  it("has a block height for mockedConnector", () => {
    expect(wrapper.vm.blockHeight).toBe("#42")
  })

  it("has a connecting state", async () => {
    await store.commit("setConnected", false)
    expect(
      wrapper
        .find(
          "#ni-disconnected-network .ni-connected-network__icon i.material-icons"
        )
        .text()
    ).toBe("rotate_right")
    expect(
      wrapper
        .find("#ni-disconnected-network .ni-connected-network__string")
        .text()
    ).toBe("Connecting to network…")
  })

  it("shows a link to the preferences page if not on the preferences page", () => {
    expect(wrapper.find("#ni-connected-network_preferences-link")).toBeDefined()
    router.push("/preferences")
    wrapper.update()
    expect(wrapper.vm.$route.name).toBe("preferences")
    expect(
      wrapper.vm.$el.querySelector("#ni-connected-network_preferences-link")
    ).toBeFalsy()
  })

  it("shows the connected node", async () => {
    instance = mount(NiConnectedNetwork)
    store = instance.store
    router = instance.router
    wrapper = instance.wrapper
    store.state.node.mocked = false
    store.state.node.nodeIP = "123.123.123.123"
    wrapper.update()
    expect(wrapper.vm.nodeAddress).toBe("123.123.123.123")
    expect(wrapper.$el).toMatchSnapshot()
  })
})
