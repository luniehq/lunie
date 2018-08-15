import TmConnectedNetwork from "common/TmConnectedNetwork"
import htmlBeautify from "html-beautify"
import setup from "../../../helpers/vuex-setup"

describe("TmConnectedNetwork", () => {
  let wrapper, router, store, instance
  let { mount } = setup()

  beforeEach(async () => {
    instance = mount(TmConnectedNetwork)
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
        .find("#tm-connected-network__icon i.material-icons")
        .text()
        .trim()
    ).toBe("wifi")
  })

  it("has a network string", () => {
    expect(
      wrapper
        .find("#tm-connected-network__string")
        .text()
        .trim()
    ).toBe("Connected to test-net via 127.0.0.1 (change network)")
  })

  it("has a block string", () => {
    expect(
      wrapper
        .find("#tm-connected-network__block")
        .text()
        .trim()
    ).toContain("Current Block: #42")
  })

  it("has a certain style for mockedConnector", () => {
    expect(wrapper.find("#tm-connected-network").classes()).toContain(
      "tm-connected-network--mocked"
    )
  })
  it("has a network tooltip for mockedConnector", () => {
    expect(wrapper.vm.networkTooltip).toBe(
      "Note: `offline demo` does not have real peers."
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

  it("has link to the external block explorer", () => {
    expect(wrapper.vm.explorerLink).toBe(
      "https://explorecosmos.network/blocks/42"
    )
  })

  it("has a connecting state", async () => {
    await store.commit("setConnected", false)
    wrapper.update()
    expect(
      wrapper
        .find(
          "#tm-disconnected-network .tm-connected-network__icon i.material-icons"
        )
        .text()
    ).toBe("rotate_right")
    expect(
      wrapper
        .find("#tm-disconnected-network .tm-connected-network__string")
        .text()
    ).toBe("Connecting to network…")
  })

  it("shows a link to the preferences page if not on the preferences page", () => {
    expect(wrapper.find("#tm-connected-network_preferences-link")).toBeDefined()
    router.push("/preferences")
    wrapper.update()
    expect(wrapper.vm.$route.name).toBe("preferences")
    expect(
      wrapper.vm.$el.querySelector("#tm-connected-network_preferences-link")
    ).toBeFalsy()
  })

  it("shows the connected node", async () => {
    instance = mount(TmConnectedNetwork)
    store = instance.store
    router = instance.router
    wrapper = instance.wrapper
    store.state.node.mocked = false
    store.state.node.nodeIP = "123.123.123.123"
    store.state.node.connected = true
    wrapper.update()
    expect(wrapper.vm.nodeAddress).toBe("123.123.123.123")
    expect(wrapper.vm.$el).toMatchSnapshot()
    expect(wrapper.vm.$el.outerHTML).toContain("123.123.123.123")
  })

  it("should close the menu if clicking on switch to live network intent", async () => {
    store.commit("setActiveMenu", "app")
    wrapper.update()
    expect(store.state.config.activeMenu).toBe("app")
    let spy = jest.spyOn(wrapper.vm, "closeMenu")
    wrapper.vm.$el
      .querySelector("#tm-connected-network_preferences-link")
      .click()
    expect(spy).toHaveBeenCalled()
    expect(store.state.config.activeMenu).not.toBe("app")
  })
})
