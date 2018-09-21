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
    ).toBe("lock")
  })

  it("has a network string", () => {
    expect(
      wrapper
        .find("#tm-connected-network__string")
        .text()
        .trim()
    ).not.toBeNull()
  })

  it("has a block string", () => {
    expect(
      wrapper
        .find("#tm-connected-network__block")
        .text()
        .trim()
    ).toContain("42")
  })

  it("has a certain style for mockedConnector", () => {
    expect(wrapper.find("#tm-connected-network").classes()).toContain(
      "tm-connected-network--mocked"
    )
  })
  it("has a network tooltip for mockedConnector", () => {
    expect(wrapper.vm.networkTooltip).toContain("offline demo")
  })

  it("has a node IP for mockedConnector", () => {
    expect(wrapper.vm.nodeIP).toBe("127.0.0.1")
  })

  it("has a chain id for mockedConnector", () => {
    expect(wrapper.vm.chainId).toBe("Test Net")
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
        .find("#tm-disconnected-network .tm-connected-network__string")
        .text()
    ).toContain("Connecting to")
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

  it("shows the connected network", async () => {
    instance = mount(TmConnectedNetwork)
    store = instance.store
    router = instance.router
    wrapper = instance.wrapper
    store.state.node.mocked = false
    store.state.node.connected = true
    store.state.node.lastHeader.chain_id = "gaia-43000"
    wrapper.update()
    expect(wrapper.vm.$el).toMatchSnapshot()
    expect(wrapper.vm.$el.outerHTML).toContain("gaia-43000")
  })
})
