import AppHeader from "common/AppHeader"
import setup from "../../../helpers/vuex-setup"

describe(`AppHeader`, () => {
  let wrapper, store, instance
  let { mount } = setup()

  beforeEach(() => {
    instance = mount(AppHeader, {
      stubs: { "app-menu": true }
    })
    wrapper = instance.wrapper
    store = instance.store
  })

  it(`has the expected html structure 1`, () => {
    store.commit(`setConfigDesktop`, true)
    store.commit(`setActiveMenu`, `app`)

    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`has the expected html structure 2`, () => {
    store.commit(`setConfigDesktop`, false)
    store.commit(`setActiveMenu`, `app`)

    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`has the expected html structure 3`, () => {
    store.commit(`setConfigDesktop`, true)
    store.commit(`setActiveMenu`, ``)

    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`has the expected html structure 4`, () => {
    store.commit(`setConfigDesktop`, false)
    store.commit(`setActiveMenu`, ``)

    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should close the app menu`, () => {
    store.commit(`setConfigDesktop`, false)
    store.commit(`setActiveMenu`, `app`)

    wrapper
      .findAll(`.header-item`)
      .at(2)
      .trigger(`click`)
    expect(store.commit).toHaveBeenCalledWith(`setActiveMenu`, ``)
  })

  it(`should open the app menu on mobile`, () => {
    store.commit(`setConfigDesktop`, false)
    store.commit(`setActiveMenu`, `notapp`)

    wrapper
      .findAll(`.header-item`)
      .at(2)
      .trigger(`click`)
    expect(store.commit).toHaveBeenCalledWith(`setActiveMenu`, `app`)
  })

  it(`should commit desktop status to true`, () => {
    global.innerWidth = 1025
    global.dispatchEvent(new Event(`resize`))

    expect(store.commit).toHaveBeenCalledWith(`setConfigDesktop`, true)
  })

  it(`should commit desktop status to false`, () => {
    global.innerWidth = 1023
    global.dispatchEvent(new Event(`resize`))

    expect(store.commit).toHaveBeenCalledWith(`setConfigDesktop`, false)
  })

  it(`handles dark theme`, () => {
    expect(wrapper.find(`#logo-white`).exists()).toBeTruthy()
  })

  it(`handles light theme`, () => {
    store.commit(`setTheme`, `light`)
    expect(wrapper.find(`#logo-black`).exists()).toBeTruthy()
  })
})
