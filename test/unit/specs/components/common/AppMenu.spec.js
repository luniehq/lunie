import AppMenu from "common/AppMenu"
import setup from "../../../helpers/vuex-setup"

describe(`AppMenu`, () => {
  let wrapper, store, instance
  let { mount } = setup()

  beforeEach(async () => {
    instance = mount(AppMenu)
    store = instance.store
    wrapper = instance.wrapper
    await store.dispatch(`signIn`, {
      account: `default`,
      password: `1234567890`
    })
  })

  it(`has the expected html structure`, () => {
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

  it(`checks whether current page is validators`, () => {
    expect(wrapper.vm.isValidatorPage).toBeFalsy()
  })

  it(`has a perfect scrollbar`, () => {
    expect(wrapper.vm.ps).toBeDefined()
  })

  it(`shows staking page because of mocked connector`, () => {
    expect(wrapper.find(`#app-menu__staking`)).toBeDefined()
  })

  it(`shows transactions page because of mocked connector`, () => {
    expect(wrapper.find(`#app-menu__transactions`)).toBeDefined()
  })

  it(`can close the app menu`, () => {
    wrapper.find(`#app-menu__wallet`).trigger(`click`)
    expect(store.commit).toHaveBeenCalled()
    expect(store.commit.mock.calls[0][0]).toBe(`setActiveMenu`)
    expect(store.commit.mock.calls[0][1]).toBeFalsy()
  })
})
