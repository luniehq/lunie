import setup from "../../../helpers/vuex-setup"
import ToolBar from "common/ToolBar"
describe(`ToolBar`, () => {
  let wrapper, store
  const { mount } = setup()

  beforeEach(() => {
    const instance = mount(ToolBar)
    wrapper = instance.wrapper
    store = instance.store
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`sets the helper modal`, () => {
    wrapper.vm.enableModalHelp()
    expect(store.state.session.modals.help.active).toBe(true)
  })

  it(`call dispatch to sign the user out`, () => {
    const $store = { dispatch: jest.fn() }
    const self = { $store, $router: { push: jest.fn() } }
    ToolBar.methods.signOut.call(self)
    expect($store.dispatch).toHaveBeenCalledWith(`signOut`)
  })

  it(`opens session modal`, () => {
    const $store = { commit: jest.fn() }
    const self = { $store }
    ToolBar.methods.signIn.call(self)
    expect($store.commit).toHaveBeenCalledWith(`setSessionModalView`, `welcome`)
    expect($store.commit).toHaveBeenCalledWith(`toggleSessionModal`, true)
  })
})
