import TmConnectedNetwork from "common/TmConnectedNetwork"
import setup from "../../../helpers/vuex-setup"

describe(`TmConnectedNetwork`, () => {
  let wrapper, store, instance
  let { mount } = setup()

  beforeEach(async () => {
    instance = mount(TmConnectedNetwork)
    store = instance.store
    wrapper = instance.wrapper
    wrapper.setData({ lastHeader: { chain_id: `Test Net`, height: 42 } })
    await store.dispatch(`setMockedConnector`, true)
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`has a network icon`, () => {
    expect(
      wrapper
        .find(`#tm-connected-network__icon i.material-icons`)
        .text()
        .trim()
    ).toBe(`lock`)
  })

  it(`has a network string`, () => {
    expect(
      wrapper
        .find(`#tm-connected-network__string`)
        .text()
        .trim()
    ).toBe(`Test Net`)
  })

  it(`has a block string`, () => {
    expect(
      wrapper
        .find(`#tm-connected-network__block`)
        .text()
        .trim()
    ).toContain(`#42`)
  })

  it(`has a certain style for mockedConnector`, () => {
    expect(wrapper.find(`#tm-connected-network`).classes()).toContain(
      `tm-connected-network--mocked`
    )
  })
  it(`has a network tooltip for mockedConnector`, () => {
    expect(wrapper.vm.networkTooltip).toBe(
      `You're using the offline demo and are not connected to any real nodes.`
    )
  })

  it(`has a chain id for mockedConnector`, () => {
    expect(wrapper.vm.chainId).toBe(`Test Net`)
  })

  it(`has a block height for mockedConnector`, () => {
    expect(wrapper.vm.blockHeight).toBe(`#42`)
  })

  it(`has link to the external block explorer`, () => {
    expect(wrapper.vm.explorerLink).toBe(
      `https://explorecosmos.network/blocks/42`
    )
  })

  it(`has a connecting state`, async () => {
    await store.commit(`setConnected`, false)
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`shows a link to the preferences page if not on the preferences page`, () => {
    expect(wrapper.find(`#tm-connected-network_preferences-link`)).toBeDefined()
    wrapper.setData({
      $route: {
        name: `preferences`
      }
    })
    expect(
      wrapper.vm.$el.querySelector(`#tm-connected-network_preferences-link`)
    ).toBeFalsy()
  })

  it(`shows the connected node`, async () => {
    instance = mount(TmConnectedNetwork)
    store = instance.store
    wrapper = instance.wrapper

    Object.assign(store.state.connection, {
      mocked: false,
      node: {
        remoteLcdURL: `123.123.123.123`
      },
      lastHeader: Object.assign(store.state.connection.lastHeader, {
        chain_id: `chain_id`
      }),
      connected: true
    })

    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`networkTooltip`, () => {
    expect(
      TmConnectedNetwork.computed.networkTooltip({ mockedConnector: true })
    ).toEqual(
      `You\'re using the offline demo and are not connected to any real nodes.`
    )

    expect(
      TmConnectedNetwork.computed.networkTooltip({
        chainId: `chainId`,
        connected: true,
        nodeURL: `http://awesomenode.de`
      })
    ).toEqual(
      `You\'re connected to the chainId testnet via node http://awesomenode.de.`
    )

    expect(
      TmConnectedNetwork.computed.networkTooltip({
        chainId: `chainId`
      })
    ).toEqual(`We\'re pinging nodes to try to connect you to chainId.`)
  })
})
