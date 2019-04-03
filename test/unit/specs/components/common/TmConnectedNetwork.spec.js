import TmConnectedNetwork from "common/TmConnectedNetwork"
import setup from "../../../helpers/vuex-setup"

describe(`TmConnectedNetwork`, () => {
  let wrapper, store
  let { mount } = setup()

  beforeEach(async () => {
    const instance = mount(TmConnectedNetwork, {
      getters: {
        lastHeader: () => ({ chain_id: `Test Net`, height: 42 }),
        nodeUrl: () => `https://faboNode.de`,
        connected: () => true
      }
    })
    store = instance.store
    wrapper = instance.wrapper
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

  it(`has link to the external block explorer`, () => {
    expect(wrapper.vm.explorerLink).toBe(
      `https://explorecosmos.network/blocks/42`
    )
  })

  it(`has a connecting state`, async () => {
    let { wrapper } = mount(TmConnectedNetwork, {
      getters: {
        lastHeader: () => ({ chain_id: `Test Net`, height: 0 }),
        connected: () => false
      }
    })
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
    let instance = mount(TmConnectedNetwork)
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
})
